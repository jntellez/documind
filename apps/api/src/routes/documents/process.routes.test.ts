import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import processDocumentRoutes, { createProcessDocumentRoutes } from "./process.routes";

describe("process document routes", () => {
  const app = new Hono().route("/api", processDocumentRoutes);

  test("GET /api/process-url returns method guidance", async () => {
    const response = await app.request("/api/process-url");

    expect(response.status).toBe(405);
    expect(await response.json()).toEqual({
      message: "This endpoint requires the POST method",
    });
  });

  test("POST /api/process-url returns processed document", async () => {
    const fakeProcessed = {
      title: "Remote Notes",
      content: "Fetched content",
      renderedHtml: "<p>Fetched content</p>",
      rawText: "Fetched content",
      sourceType: "url",
      sourceName: "example.com",
      sourceMimeType: "text/html",
      original_url: "https://example.com/notes",
    } as const;

    const ingestUrlDocument = async (url: string) => {
      expect(url).toBe("https://example.com/notes");
      return fakeProcessed;
    };

    const appWithFakes = new Hono().route(
      "/api",
      createProcessDocumentRoutes({
        detectSupportedFileType: () => "pdf",
        ingestPdfFile: async () => fakeProcessed,
        ingestDocxFile: async () => fakeProcessed,
        ingestPptxFile: async () => fakeProcessed,
        ingestUrlDocument,
      }),
    );

    const response = await appWithFakes.request("/api/process-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/notes" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(fakeProcessed);
  });

  test("POST /api/process-url maps ingestion dependency failures to 400", async () => {
    const appWithFailingIngestor = new Hono().route(
      "/api",
      createProcessDocumentRoutes({
        detectSupportedFileType: () => "pdf",
        ingestPdfFile: async () => {
          throw new Error("unused");
        },
        ingestDocxFile: async () => {
          throw new Error("unused");
        },
        ingestPptxFile: async () => {
          throw new Error("unused");
        },
        ingestUrlDocument: async () => {
          throw new Error("Could not fetch URL content");
        },
      }),
    );

    const response = await appWithFailingIngestor.request("/api/process-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/fail" }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Could not fetch URL content" });
  });

  test("POST /api/process-file rejects when multipart file is missing", async () => {
    const formData = new FormData();
    const response = await app.request("/api/process-file", {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Missing file in multipart field 'file'",
    });
  });

  test("POST /api/process-file rejects unsupported file types", async () => {
    const formData = new FormData();
    formData.append("file", new File(["hello"], "notes.txt", { type: "text/plain" }));

    const response = await app.request("/api/process-file", {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Unsupported file type. Only PDF, DOCX, and PPTX are currently supported.",
      sourceMimeType: "text/plain;charset=utf-8",
      sourceName: "notes.txt",
    });
  });

  test("POST /api/process-file returns processed document for supported file", async () => {
    const fakeProcessed = {
      title: "Meeting Notes",
      content: "Parsed content",
      renderedHtml: "<p>Parsed content</p>",
      rawText: "Parsed content",
      sourceType: "file",
      sourceName: "meeting.pdf",
      sourceMimeType: "application/pdf",
      original_url: "file://meeting.pdf",
    } as const;
    const ingestPdfFile = async (file: File) => {
      expect(file.name).toBe("meeting.pdf");
      expect(file.type).toBe("application/pdf");
      return fakeProcessed;
    };

    const appWithFakes = new Hono().route(
      "/api",
      createProcessDocumentRoutes({
        detectSupportedFileType: () => "pdf",
        ingestPdfFile,
        ingestDocxFile: async () => fakeProcessed,
        ingestPptxFile: async () => fakeProcessed,
        ingestUrlDocument: async () => fakeProcessed,
      }),
    );

    const formData = new FormData();
    formData.append("file", new File(["%PDF test"], "meeting.pdf", { type: "application/pdf" }));

    const response = await appWithFakes.request("/api/process-file", {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(fakeProcessed);
  });

  test("POST /api/process-file maps ingestion dependency failures to 400", async () => {
    const appWithFailingIngestor = new Hono().route(
      "/api",
      createProcessDocumentRoutes({
        detectSupportedFileType: () => "pdf",
        ingestPdfFile: async () => {
          throw new Error("Parser unavailable");
        },
        ingestDocxFile: async () => {
          throw new Error("unused");
        },
        ingestPptxFile: async () => {
          throw new Error("unused");
        },
        ingestUrlDocument: async () => {
          throw new Error("unused");
        },
      }),
    );

    const formData = new FormData();
    formData.append("file", new File(["%PDF test"], "meeting.pdf", { type: "application/pdf" }));

    const response = await appWithFailingIngestor.request("/api/process-file", {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Parser unavailable" });
  });
});
