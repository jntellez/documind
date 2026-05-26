import type { ProcessedDocument } from "@documind/types";
import { Hono } from "hono";
import { config } from "../../config";
import { buildSanitizedErrorPayload } from "../../lib/httpErrors";
import { createRateLimit } from "../../middleware/rateLimit";
import {
  detectSupportedFileType,
  ingestDocxFile,
  ingestPdfFile,
  ingestPptxFile,
  ingestUrlDocument,
} from "../../services/documentIngestion.service";
import { ProcessUrlRequestSchema } from "./schemas";

type ProcessDocumentDeps = {
  detectSupportedFileType: typeof detectSupportedFileType;
  ingestUrlDocument: typeof ingestUrlDocument;
  ingestPdfFile: typeof ingestPdfFile;
  ingestDocxFile: typeof ingestDocxFile;
  ingestPptxFile: typeof ingestPptxFile;
};

const defaultDeps: ProcessDocumentDeps = {
  detectSupportedFileType,
  ingestUrlDocument,
  ingestPdfFile,
  ingestDocxFile,
  ingestPptxFile,
};

export function createProcessDocumentRoutes(deps: ProcessDocumentDeps = defaultDeps) {
  const processDocumentRoutes = new Hono();
  const processRateLimit = createRateLimit({
    key: "document-processing",
    windowMs: config.rateLimitWindowMs,
    max: config.documentRateLimitMax,
  });

  processDocumentRoutes.post("/process-url", processRateLimit, async (c) => {
    try {
      const body = await c.req.json();
      const validatedData = ProcessUrlRequestSchema.parse(body);
      const processedDocument: ProcessedDocument = await deps.ingestUrlDocument(
        validatedData.url,
      );

      return c.json(processedDocument);
    } catch (error) {
      return c.json(buildSanitizedErrorPayload(error, "Unable to process URL"), 400);
    }
  });

  processDocumentRoutes.get("/process-url", (c) => {
    return c.json({ message: "This endpoint requires the POST method" }, 405);
  });

  processDocumentRoutes.post("/process-file", processRateLimit, async (c) => {
    try {
      const formData = await c.req.formData();
      const entry = formData.get("file");

      if (!(entry instanceof File)) {
        return c.json({ error: "Missing file in multipart field 'file'" }, 400);
      }

      const mimeType = entry.type || "";
      const supportedFileType = deps.detectSupportedFileType(entry);

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
          ? await deps.ingestPdfFile(entry)
          : supportedFileType === "docx"
            ? await deps.ingestDocxFile(entry)
            : await deps.ingestPptxFile(entry);

      return c.json(processedDocument);
    } catch (error) {
      return c.json(buildSanitizedErrorPayload(error, "Unable to process file"), 400);
    }
  });

  processDocumentRoutes.get("/process-file", (c) => {
    return c.json({ message: "This endpoint requires the POST method" }, 405);
  });

  return processDocumentRoutes;
}

export default createProcessDocumentRoutes();
