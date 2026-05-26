import type { ProcessedDocument } from "@documind/types";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { config } from "../../config";
import pg from "../../db";
import { buildSanitizedErrorPayload } from "../../lib/httpErrors";
import {
  createUsageLimit,
  getClientIp,
  getUserIdFromPayload,
  secondsUntilMidnightUtc,
} from "../../middleware/usageLimit";
import { getUsageCount } from "../../repositories/usage.repository";
import {
  detectSupportedFileType,
  ingestDocxFile,
  ingestPdfFile,
  ingestPptxFile,
  ingestUrlDocument,
} from "../../services/documentIngestion.service";
import type { JwtPayload } from "./helpers";
import { ProcessUrlRequestSchema } from "./schemas";

async function attachOptionalJwtPayload(c: any, next: any) {
  const authHeader = c.req.header("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice("Bearer ".length);
      const payload = await verify(token, config.jwtSecret, "HS256") as JwtPayload;
      c.set("jwtPayload", payload);
    } catch {
      // Ignore invalid tokens here: processing supports guest access.
    }
  }

  await next();
}

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
  const processUsageLimit = createUsageLimit({
    type: "processing",
    guestMax: config.guestProcessingLimit,
    authMax: config.authProcessingLimit,
  });

  processDocumentRoutes.post("/process-url", attachOptionalJwtPayload, processUsageLimit, async (c) => {
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

  processDocumentRoutes.post("/process-file", attachOptionalJwtPayload, processUsageLimit, async (c) => {
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

  processDocumentRoutes.get("/usage-summary", async (c) => {
    try {
      const authHeader = c.req.header("authorization");
      let userId: number | undefined;

      if (authHeader?.startsWith("Bearer ")) {
        try {
          const token = authHeader.slice("Bearer ".length);
          const payload = await verify(token, config.jwtSecret, "HS256") as JwtPayload;
          userId = getUserIdFromPayload(payload);
        } catch {
          userId = undefined;
        }
      }

      const ip = getClientIp(c);
      const date = new Date().toISOString().slice(0, 10);
      const resetInSeconds = secondsUntilMidnightUtc();

      const processingCount = await getUsageCount(pg, {
        userId,
        ip,
        type: "processing",
        date,
      });

      const chatCount = userId
        ? await getUsageCount(pg, {
            userId,
            ip,
            type: "chat",
            date,
          })
        : 0;

      return c.json({
        processing: {
          count: processingCount,
          limit: userId ? config.authProcessingLimit : config.guestProcessingLimit,
          resetInSeconds,
        },
        chat: userId
          ? {
              count: chatCount,
              limit: config.chatLimit,
              resetInSeconds,
            }
          : null,
      });
    } catch (error) {
      return c.json(buildSanitizedErrorPayload(error, "Unable to load usage summary"), 400);
    }
  });

  return processDocumentRoutes;
}

export default createProcessDocumentRoutes();
