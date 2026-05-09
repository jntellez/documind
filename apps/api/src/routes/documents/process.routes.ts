import type { ProcessedDocument } from "@documind/types";
import { Hono } from "hono";
import {
  detectSupportedFileType,
  ingestDocxFile,
  ingestPdfFile,
  ingestPptxFile,
  ingestUrlDocument,
} from "../../services/documentIngestion.service";
import { ProcessUrlRequestSchema } from "./schemas";

const processDocumentRoutes = new Hono();

processDocumentRoutes.post("/process-url", async (c) => {
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

processDocumentRoutes.get("/process-url", (c) => {
  return c.json({ message: "This endpoint requires the POST method" }, 405);
});

processDocumentRoutes.post("/process-file", async (c) => {
  try {
    const formData = await c.req.formData();
    const entry = formData.get("file");

    if (!(entry instanceof File)) {
      return c.json({ error: "Missing file in multipart field 'file'" }, 400);
    }

    const mimeType = entry.type || "";
    const supportedFileType = detectSupportedFileType(entry);

    if (!supportedFileType) {
      return c.json(
        {
          error: "Unsupported file type. Only PDF, DOCX, and PPTX are currently supported.",
          sourceMimeType: mimeType || undefined,
          sourceName: entry.name,
        },
        400,
      );
    }

    const processedDocument: ProcessedDocument =
      supportedFileType === "pdf"
        ? await ingestPdfFile(entry)
        : supportedFileType === "docx"
          ? await ingestDocxFile(entry)
          : await ingestPptxFile(entry);
    return c.json(processedDocument);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: errorMessage, details: error }, 400);
  }
});

processDocumentRoutes.get("/process-file", (c) => {
  return c.json({ message: "This endpoint requires the POST method" }, 405);
});

export default processDocumentRoutes;
