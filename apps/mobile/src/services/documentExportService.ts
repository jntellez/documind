import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { Document } from "@documind/types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildContentHtml(document: Document) {
  if (document.renderedHtml && document.renderedHtml.trim().length > 0) {
    return document.renderedHtml;
  }

  return escapeHtml(document.content).replaceAll(/\r?\n/g, "<br />");
}

export function buildDocumentExportHtml(document: Document) {
  const title = escapeHtml(document.title || "Untitled document");
  const contentHtml = buildContentHtml(document);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #111827;
        line-height: 1.65;
        margin: 32px;
        font-size: 14px;
      }

      h1 {
        font-size: 24px;
        margin: 0 0 20px;
        line-height: 1.3;
      }

      h2, h3, h4, h5, h6 {
        margin: 22px 0 10px;
        line-height: 1.35;
      }

      p {
        margin: 0 0 12px;
      }

      ul, ol {
        margin: 0 0 14px 20px;
      }

      li + li {
        margin-top: 6px;
      }

      blockquote {
        border-left: 3px solid #d1d5db;
        margin: 14px 0;
        padding: 2px 0 2px 12px;
        color: #374151;
      }

      code {
        background: #f3f4f6;
        border-radius: 4px;
        padding: 1px 4px;
      }

      pre {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        overflow-x: auto;
        padding: 12px;
      }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    ${contentHtml}
  </body>
</html>`;
}

export async function shareDocumentAsPdf(document: Document) {
  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error("Sharing is not available on this device");
  }

  const html = buildDocumentExportHtml(document);
  const safeTitle = (document.title || "document")
    .trim()
    .replaceAll(/[^a-zA-Z0-9-_ ]/g, "")
    .replaceAll(/\s+/g, "-")
    .toLowerCase();

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: `Share ${safeTitle || "document"}`,
    UTI: ".pdf",
  });
}
