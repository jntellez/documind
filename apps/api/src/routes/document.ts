import type {
  GetDocumentResponse,
  GetDocumentsResponse,
  ProcessUrlRequest,
  ProcessedDocument,
  SaveDocumentRequest,
  SaveDocumentResponse,
  UpdateDocumentRequest,
} from "@documind/types";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { z } from "zod";
import { config } from "../config";
import pg from "../db";
import { countWords } from "../lib/document-text";
import {
  ensureDocumentIngestionColumns,
  ingestDocxFile,
  ingestPdfFile,
  ingestUrlDocument,
} from "../services/documentIngestion.service";
import { reindexDocumentChunks } from "../services/documentChunks.service";

const ProcessUrlRequestSchema = z.object({
  url: z.string().url(),
}) satisfies z.ZodType<ProcessUrlRequest>;

type DocumentListItemInput = {
  text: string;
  marker?: string;
  children?: DocumentListItemInput[];
};

const DocumentListItemSchema: z.ZodType<DocumentListItemInput> = z.lazy(() =>
  z.object({
    text: z.string(),
    marker: z.string().optional(),
    children: z.array(DocumentListItemSchema).optional(),
  }),
);

const DocumentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    text: z.string(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]).optional(),
  }),
  z.object({ type: z.literal("paragraph"), text: z.string() }),
  z.object({
    type: z.literal("list"),
    ordered: z.boolean().optional(),
    items: z.array(z.union([z.string(), DocumentListItemSchema])),
  }),
  z.object({ type: z.literal("divider") }),
]);

const SaveDocumentRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  renderedHtml: z.string().optional(),
  rawText: z.string().optional(),
  blocks: z.array(DocumentBlockSchema).optional(),
  sourceType: z.string().optional(),
  sourceName: z.string().optional(),
  sourceMimeType: z.string().optional(),
  originalUrl: z.string().min(1).optional(),
  original_url: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
}) satisfies z.ZodType<SaveDocumentRequest>;

const UpdateDocumentRequestSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  content: z.string().min(1, "Content cannot be empty").optional(),
  renderedHtml: z.string().min(1).optional(),
  rawText: z.string().optional(),
  blocks: z.array(DocumentBlockSchema).optional(),
  sourceType: z.string().optional(),
  sourceName: z.string().optional(),
  sourceMimeType: z.string().optional(),
  originalUrl: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
}) satisfies z.ZodType<UpdateDocumentRequest>;

const documentRoutes = new Hono();
const authJwt = jwt({ secret: config.jwtSecret, alg: "HS256" });

type JwtPayload = {
  sub?: string | number;
  id?: string | number;
};

function serializeDocumentRow(row: any) {
  const renderedHtml = row.rendered_html ?? row.content;
  const rawText = row.raw_text ?? renderedHtml;
  const blocks = row.canonical_blocks ?? undefined;
  const sourceType = row.source_type ?? "url";
  const sourceName = row.source_name ?? undefined;
  const sourceMimeType = row.source_mime_type ?? undefined;
  const originalUrl = row.original_url_v2 ?? row.original_url ?? undefined;

  return {
    ...row,
    content: renderedHtml,
    renderedHtml,
    rawText,
    blocks,
    sourceType,
    sourceName,
    sourceMimeType,
    originalUrl,
  };
}

documentRoutes.post("/process-url", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = ProcessUrlRequestSchema.parse(body);
    const processedDocument: ProcessedDocument = await ingestUrlDocument(validatedData.url);

    return c.json(processedDocument);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: errorMessage, details: error }, 400);
  }
});

documentRoutes.get("/process-url", (c) => {
  return c.json({ message: "This endpoint requires the POST method" }, 405);
});

documentRoutes.post("/process-file", async (c) => {
  try {
    const formData = await c.req.formData();
    const entry = formData.get("file");

    if (!(entry instanceof File)) {
      return c.json({ error: "Missing file in multipart field 'file'" }, 400);
    }

    const mimeType = entry.type || "";
    const isPdfByMime = mimeType === "application/pdf";
    const isPdfByName = /\.pdf$/i.test(entry.name);
    const isDocxByMime =
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const isDocxByName = /\.docx$/i.test(entry.name);
    const isPptxByMime =
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    const isPptxByName = /\.pptx$/i.test(entry.name);

    if (isPptxByMime || isPptxByName) {
      return c.json(
        {
          error: "PPTX todavía no está soportado. Por ahora usa PDF o DOCX.",
          sourceMimeType: mimeType || undefined,
          sourceName: entry.name,
        },
        400,
      );
    }

    if (!isPdfByMime && !isPdfByName && !isDocxByMime && !isDocxByName) {
      return c.json(
        {
          error: "Unsupported file type. Only PDF and DOCX are currently supported.",
          sourceMimeType: mimeType || undefined,
          sourceName: entry.name,
        },
        400,
      );
    }

    const processedDocument: ProcessedDocument =
      isPdfByMime || isPdfByName ? await ingestPdfFile(entry) : await ingestDocxFile(entry);
    return c.json(processedDocument);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: errorMessage, details: error }, 400);
  }
});

documentRoutes.get("/process-file", (c) => {
  return c.json({ message: "This endpoint requires the POST method" }, 405);
});

documentRoutes.post("/save-document", authJwt, async (c) => {
  try {
    await ensureDocumentIngestionColumns();

    const payload = c.get("jwtPayload") as JwtPayload;
    const userId = Number(payload.sub || payload.id);

    if (!userId) {
      return c.json({ error: "Invalid user ID in token" }, 401);
    }

    const body = await c.req.json();
    const validatedData = SaveDocumentRequestSchema.parse(body);
    const createdAt = new Date();
    const updatedAt = new Date();
    const renderedHtml = validatedData.renderedHtml ?? validatedData.content;
    const rawText = validatedData.rawText ?? renderedHtml;
    const blocks = validatedData.blocks;
    const sourceType = validatedData.sourceType ?? "url";
    const sourceName = validatedData.sourceName;
    const sourceMimeType = validatedData.sourceMimeType;
    const originalUrl = validatedData.originalUrl ?? validatedData.original_url;
    const wordCount = countWords(rawText);

    const tagsPgFormat = `{${validatedData.tags.map((tag) => `"${tag.replace(/"/g, '\\"')}"`).join(",")}}`;

    const result = await pg.begin(async (tx: any) => {
      const inserted = await tx`
        INSERT INTO documents (
          title,
          content,
          rendered_html,
          raw_text,
          source_type,
          source_name,
          source_mime_type,
          canonical_blocks,
          original_url_v2,
          original_url,
          word_count,
          created_at,
          updated_at,
          user_id,
          tags
        )
        VALUES (
          ${validatedData.title},
          ${validatedData.content},
          ${renderedHtml},
          ${rawText},
          ${sourceType},
          ${sourceName ?? null},
          ${sourceMimeType ?? null},
          ${blocks ? JSON.stringify(blocks) : null}::jsonb,
          ${originalUrl},
          ${validatedData.original_url},
          ${wordCount},
          ${createdAt},
          ${updatedAt},
          ${userId},
          ${tagsPgFormat}
        )
        RETURNING id, title, content, rendered_html, raw_text, canonical_blocks, source_type, source_name, source_mime_type, original_url_v2, original_url, word_count, created_at, updated_at, tags
      `;

      await reindexDocumentChunks(tx, {
        documentId: Number(inserted[0].id),
        renderedHtml,
        rawText,
      });

      return inserted;
    });

    const saveResponse: SaveDocumentResponse = {
      success: true,
      document: serializeDocumentRow(result[0]),
    };

    return c.json(saveResponse, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error saving document:", error);
    return c.json({ error: errorMessage, details: error }, 400);
  }
});

documentRoutes.get("/documents", authJwt, async (c) => {
  try {
    await ensureDocumentIngestionColumns();

    const payload = c.get("jwtPayload") as JwtPayload;
    const userId = Number(payload.sub || payload.id);

    if (!userId) {
      return c.json({ error: "Invalid user ID in token" }, 401);
    }

    const documents = await pg`
      SELECT
        id,
        title,
        content,
        COALESCE(rendered_html, content) AS rendered_html,
        COALESCE(raw_text, content) AS raw_text,
        COALESCE(source_type, 'url') AS source_type,
        source_name,
        source_mime_type,
        canonical_blocks,
        COALESCE(original_url_v2, original_url) AS original_url_v2,
        original_url,
        word_count,
        created_at,
        updated_at,
        tags
      FROM documents
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    const response: GetDocumentsResponse = {
      success: true,
      documents: documents.map(serializeDocumentRow),
      count: documents.length,
    };

    return c.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching documents:", error);
    return c.json({ error: errorMessage }, 400);
  }
});

documentRoutes.get("/documents/:id", authJwt, async (c) => {
  try {
    await ensureDocumentIngestionColumns();

    const payload = c.get("jwtPayload") as JwtPayload;
    const userId = Number(payload.sub || payload.id);

    if (!userId) {
      return c.json({ error: "Invalid user ID in token" }, 401);
    }

    const documentId = Number(c.req.param("id"));

    if (!documentId || Number.isNaN(documentId)) {
      return c.json({ error: "Invalid document ID" }, 400);
    }

    const documents = await pg`
      SELECT
        id,
        title,
        content,
        COALESCE(rendered_html, content) AS rendered_html,
        COALESCE(raw_text, content) AS raw_text,
        COALESCE(source_type, 'url') AS source_type,
        source_name,
        source_mime_type,
        canonical_blocks,
        COALESCE(original_url_v2, original_url) AS original_url_v2,
        original_url,
        word_count,
        created_at,
        updated_at,
        tags
      FROM documents
      WHERE id = ${documentId} AND user_id = ${userId}
    `;

    if (documents.length === 0) {
      return c.json({ error: "Document not found" }, 404);
    }

    const response: GetDocumentResponse = {
      success: true,
      document: serializeDocumentRow(documents[0]),
    };

    return c.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching document:", error);
    return c.json({ error: errorMessage }, 400);
  }
});

documentRoutes.patch("/documents/:id", authJwt, async (c) => {
  try {
    await ensureDocumentIngestionColumns();

    const payload = c.get("jwtPayload") as JwtPayload;
    const userId = Number(payload.sub || payload.id);

    if (!userId) {
      return c.json({ error: "Invalid user ID in token" }, 401);
    }

    const documentId = Number(c.req.param("id"));

    if (!documentId || Number.isNaN(documentId)) {
      return c.json({ error: "Invalid document ID" }, 400);
    }

    const body = await c.req.json();
    const validatedData = UpdateDocumentRequestSchema.parse(body);

    if (Object.keys(validatedData).length === 0) {
      return c.json({ error: "No fields provided to update" }, 400);
    }

    const existingDocs = await pg`
      SELECT * FROM documents
      WHERE id = ${documentId} AND user_id = ${userId}
    `;

    if (existingDocs.length === 0) {
      return c.json({ error: "Document not found or unauthorized" }, 404);
    }

    const currentDoc = existingDocs[0];
    const newTitle = validatedData.title ?? currentDoc.title;
    const newRenderedHtml = validatedData.renderedHtml ?? validatedData.content ?? currentDoc.rendered_html ?? currentDoc.content;
    const newRawText = validatedData.rawText ?? currentDoc.raw_text ?? newRenderedHtml;
    const newBlocks = validatedData.blocks ?? currentDoc.canonical_blocks ?? null;
    const newContent = validatedData.content ?? validatedData.renderedHtml ?? currentDoc.content;
    const newSourceType = validatedData.sourceType ?? currentDoc.source_type ?? "url";
    const newSourceName = validatedData.sourceName ?? currentDoc.source_name ?? null;
    const newSourceMimeType = validatedData.sourceMimeType ?? currentDoc.source_mime_type ?? null;
    const newOriginalUrl = validatedData.originalUrl ?? currentDoc.original_url_v2 ?? currentDoc.original_url;
    const newTags = validatedData.tags ?? currentDoc.tags ?? [];
    const updatedAt = new Date();
    const tagsPgFormat = `{${newTags.map((tag: string) => `"${tag.replace(/"/g, '\\"')}"`).join(",")}}`;

    let newWordCount = currentDoc.word_count;

    if (validatedData.content || validatedData.renderedHtml || validatedData.rawText) {
      newWordCount = countWords(newRawText);
    }

    const result = await pg.begin(async (tx: any) => {
      const updated = await tx`
        UPDATE documents
        SET
          title = ${newTitle},
          content = ${newContent},
          rendered_html = ${newRenderedHtml},
          raw_text = ${newRawText},
          source_type = ${newSourceType},
          source_name = ${newSourceName},
          source_mime_type = ${newSourceMimeType},
          canonical_blocks = ${newBlocks ? JSON.stringify(newBlocks) : null}::jsonb,
          original_url_v2 = ${newOriginalUrl},
          tags = ${tagsPgFormat},
          word_count = ${newWordCount},
          updated_at = ${updatedAt}
        WHERE id = ${documentId} AND user_id = ${userId}
        RETURNING id, title, content, rendered_html, raw_text, canonical_blocks, source_type, source_name, source_mime_type, original_url_v2, original_url, word_count, created_at, updated_at, tags
      `;

      await reindexDocumentChunks(tx, {
        documentId,
        renderedHtml: newRenderedHtml,
        rawText: newRawText,
      });

      return updated;
    });

    return c.json({ success: true, document: serializeDocumentRow(result[0]) });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating document:", error);
    return c.json({ error: errorMessage, details: error }, 400);
  }
});

documentRoutes.delete("/documents/:id", authJwt, async (c) => {
  try {
    const payload = c.get("jwtPayload") as JwtPayload;
    const userId = Number(payload.sub || payload.id);

    if (!userId) {
      return c.json({ error: "Invalid user ID in token" }, 401);
    }

    const documentId = Number(c.req.param("id"));

    if (!documentId || Number.isNaN(documentId)) {
      return c.json({ error: "Invalid document ID" }, 400);
    }

    const result = await pg`
      DELETE FROM documents
      WHERE id = ${documentId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return c.json({ error: "Document not found or unauthorized" }, 404);
    }

    return c.json({
      success: true,
      message: "Document deleted successfully",
      deletedId: result[0].id,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting document:", error);
    return c.json({ error: errorMessage }, 400);
  }
});

export default documentRoutes;
