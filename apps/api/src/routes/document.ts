import { Readability } from "@mozilla/readability";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { JSDOM } from "jsdom";
import { z } from "zod";
import { config } from "../config";
import pg from "../db";

const ProcessUrlRequest = z.object({
  url: z.string().url(),
});

const SaveDocumentRequest = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  original_url: z.string().url(),
  tags: z.array(z.string()).optional().default([]),
});

const UpdateDocumentRequest = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  content: z.string().min(1, "Content cannot be empty").optional(),
  tags: z.array(z.string()).optional(),
});

const documentRoutes = new Hono();
const authJwt = jwt({ secret: config.jwtSecret, alg: "HS256" });

type JwtPayload = {
  sub?: string | number;
  id?: string | number;
};

documentRoutes.post("/process-url", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = ProcessUrlRequest.parse(body);
    const pageUrl = validatedData.url;

    const response = await fetch(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const doc = new JSDOM(html, { url: pageUrl });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error("Failed to parse article (article was null)");
    }

    if (!article.content) {
      throw new Error("Failed to extract content (article.content was null)");
    }

    return c.json({
      title: article.title || "Title not found",
      content: article.content.replace(/\n\s*/g, ""),
      original_url: pageUrl,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: errorMessage, details: error }, 400);
  }
});

documentRoutes.get("/process-url", (c) => {
  return c.json({ message: "This endpoint requires the POST method" }, 405);
});

documentRoutes.post("/save-document", authJwt, async (c) => {
  try {
    const payload = c.get("jwtPayload") as JwtPayload;
    const userId = Number(payload.sub || payload.id);

    if (!userId) {
      return c.json({ error: "Invalid user ID in token" }, 401);
    }

    const body = await c.req.json();
    const validatedData = SaveDocumentRequest.parse(body);
    const createdAt = new Date();
    const updatedAt = new Date();
    const wordCount = validatedData.content
      .replace(/<[^>]*>/g, "")
      .split(/\s+/)
      .filter(Boolean).length;

    const tagsPgFormat = `{${validatedData.tags.map((tag) => `"${tag.replace(/"/g, '\\"')}"`).join(",")}}`;

    const result = await pg`
      INSERT INTO documents (
        title,
        content,
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
        ${validatedData.original_url},
        ${wordCount},
        ${createdAt},
        ${updatedAt},
        ${userId},
        ${tagsPgFormat}
      )
      RETURNING id, title, content, original_url, word_count, created_at, updated_at, tags
    `;

    return c.json({ success: true, document: result[0] }, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error saving document:", error);
    return c.json({ error: errorMessage, details: error }, 400);
  }
});

documentRoutes.get("/documents", authJwt, async (c) => {
  try {
    const payload = c.get("jwtPayload") as JwtPayload;
    const userId = Number(payload.sub || payload.id);

    if (!userId) {
      return c.json({ error: "Invalid user ID in token" }, 401);
    }

    const documents = await pg`
      SELECT
        id,
        title,
        original_url,
        word_count,
        created_at,
        updated_at,
        tags
      FROM documents
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return c.json({ success: true, documents, count: documents.length });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching documents:", error);
    return c.json({ error: errorMessage }, 400);
  }
});

documentRoutes.get("/documents/:id", authJwt, async (c) => {
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

    const documents = await pg`
      SELECT
        id,
        title,
        content,
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

    return c.json({ success: true, document: documents[0] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching document:", error);
    return c.json({ error: errorMessage }, 400);
  }
});

documentRoutes.patch("/documents/:id", authJwt, async (c) => {
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

    const body = await c.req.json();
    const validatedData = UpdateDocumentRequest.parse(body);

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
    const newContent = validatedData.content ?? currentDoc.content;
    const newTags = validatedData.tags ?? currentDoc.tags ?? [];
    const updatedAt = new Date();
    const tagsPgFormat = `{${newTags.map((tag: string) => `"${tag.replace(/"/g, '\\"')}"`).join(",")}}`;

    let newWordCount = currentDoc.word_count;

    if (validatedData.content) {
      newWordCount = validatedData.content
        .replace(/<[^>]*>/g, "")
        .split(/\s+/)
        .filter(Boolean).length;
    }

    const result = await pg`
      UPDATE documents
      SET
        title = ${newTitle},
        content = ${newContent},
        tags = ${tagsPgFormat},
        word_count = ${newWordCount},
        updated_at = ${updatedAt}
      WHERE id = ${documentId} AND user_id = ${userId}
      RETURNING id, title, content, original_url, word_count, created_at, updated_at, tags
    `;

    return c.json({ success: true, document: result[0] });
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
