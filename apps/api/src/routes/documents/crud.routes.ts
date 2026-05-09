import type {
  GetDocumentResponse,
  GetDocumentsResponse,
  SaveDocumentResponse,
} from "@documind/types";
import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import pg from "../../db";
import { countWords } from "../../lib/document-text";
import {
  deleteDocumentByIdForUser,
  getDocumentByIdForUser,
  getRawDocumentByIdForUser,
  insertDocument,
  listDocumentsByUser,
  updateDocumentByIdForUser,
} from "../../repositories/documents.repository";
import { ensureDocumentIngestionColumns } from "../../services/documentIngestion.service";
import { reindexDocumentChunks } from "../../services/documentChunks.service";
import { getUserId, parseDocumentId, type JwtPayload, toPgTextArray } from "./helpers";
import { SaveDocumentRequestSchema, UpdateDocumentRequestSchema } from "./schemas";
import { serializeDocumentRow } from "./serializers";

const crudDocumentRoutes = new Hono();

export function registerCrudDocumentRoutes(authJwt: MiddlewareHandler) {
  crudDocumentRoutes.post("/save-document", authJwt, async (c) => {
    try {
      await ensureDocumentIngestionColumns();

      const payload = c.get("jwtPayload") as JwtPayload;
      const userId = getUserId(payload);

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
      const tagsPgFormat = toPgTextArray(validatedData.tags);

      const result = await pg.begin(async (tx: any) => {
        const inserted = await insertDocument(tx, {
          title: validatedData.title,
          content: validatedData.content,
          renderedHtml,
          rawText,
          sourceType,
          sourceName: sourceName ?? null,
          sourceMimeType: sourceMimeType ?? null,
          blocks,
          originalUrl,
          originalUrlLegacy: validatedData.original_url,
          wordCount,
          createdAt,
          updatedAt,
          userId,
          tagsPgFormat,
        });

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

  crudDocumentRoutes.get("/documents", authJwt, async (c) => {
    try {
      await ensureDocumentIngestionColumns();

      const payload = c.get("jwtPayload") as JwtPayload;
      const userId = getUserId(payload);

      if (!userId) {
        return c.json({ error: "Invalid user ID in token" }, 401);
      }

      const documents = await listDocumentsByUser(userId);

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

  crudDocumentRoutes.get("/documents/:id", authJwt, async (c) => {
    try {
      await ensureDocumentIngestionColumns();

      const payload = c.get("jwtPayload") as JwtPayload;
      const userId = getUserId(payload);

      if (!userId) {
        return c.json({ error: "Invalid user ID in token" }, 401);
      }

      const documentId = parseDocumentId(c.req.param("id"));

      if (!documentId) {
        return c.json({ error: "Invalid document ID" }, 400);
      }

      const documents = await getDocumentByIdForUser(documentId, userId);

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

  crudDocumentRoutes.patch("/documents/:id", authJwt, async (c) => {
    try {
      await ensureDocumentIngestionColumns();

      const payload = c.get("jwtPayload") as JwtPayload;
      const userId = getUserId(payload);

      if (!userId) {
        return c.json({ error: "Invalid user ID in token" }, 401);
      }

      const documentId = parseDocumentId(c.req.param("id"));

      if (!documentId) {
        return c.json({ error: "Invalid document ID" }, 400);
      }

      const body = await c.req.json();
      const validatedData = UpdateDocumentRequestSchema.parse(body);

      if (Object.keys(validatedData).length === 0) {
        return c.json({ error: "No fields provided to update" }, 400);
      }

      const existingDocs = await getRawDocumentByIdForUser(documentId, userId);

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
      const tagsPgFormat = toPgTextArray(newTags);

      let newWordCount = currentDoc.word_count;

      if (validatedData.content || validatedData.renderedHtml || validatedData.rawText) {
        newWordCount = countWords(newRawText);
      }

      const result = await pg.begin(async (tx: any) => {
        const updated = await updateDocumentByIdForUser(tx, {
          documentId,
          userId,
          title: newTitle,
          content: newContent,
          renderedHtml: newRenderedHtml,
          rawText: newRawText,
          sourceType: newSourceType,
          sourceName: newSourceName,
          sourceMimeType: newSourceMimeType,
          blocks: newBlocks,
          originalUrl: newOriginalUrl,
          tagsPgFormat,
          wordCount: newWordCount,
          updatedAt,
        });

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

  crudDocumentRoutes.delete("/documents/:id", authJwt, async (c) => {
    try {
      const payload = c.get("jwtPayload") as JwtPayload;
      const userId = getUserId(payload);

      if (!userId) {
        return c.json({ error: "Invalid user ID in token" }, 401);
      }

      const documentId = parseDocumentId(c.req.param("id"));

      if (!documentId) {
        return c.json({ error: "Invalid document ID" }, 400);
      }

      const result = await deleteDocumentByIdForUser(documentId, userId);

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

  return crudDocumentRoutes;
}
