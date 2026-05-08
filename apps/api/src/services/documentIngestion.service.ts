import { Readability } from "@mozilla/readability";
import type { ProcessedDocument } from "@documind/types";
import { JSDOM } from "jsdom";
import { PDFParse } from "pdf-parse";
import pg from "../db";
import { documentContentToPlainText } from "../lib/document-text";

let ensureIngestionColumnsPromise: Promise<void> | null = null;

export function ensureDocumentIngestionColumns() {
  if (ensureIngestionColumnsPromise) {
    return ensureIngestionColumnsPromise;
  }

  ensureIngestionColumnsPromise = (async () => {
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS rendered_html TEXT`;
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS raw_text TEXT`;
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_type TEXT`;
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_name TEXT`;
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_mime_type TEXT`;
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS original_url_v2 TEXT`;

    await pg`
      UPDATE documents
      SET
        rendered_html = COALESCE(rendered_html, content),
        raw_text = COALESCE(raw_text, ''),
        source_type = COALESCE(source_type, 'url'),
        original_url_v2 = COALESCE(original_url_v2, original_url)
      WHERE rendered_html IS NULL
         OR raw_text IS NULL
         OR source_type IS NULL
         OR original_url_v2 IS NULL
    `;

    await pg`UPDATE documents SET raw_text = content WHERE raw_text = ''`;
  })();

  return ensureIngestionColumnsPromise;
}

export async function ingestUrlDocument(url: string): Promise<ProcessedDocument> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText}`);
  }

  const html = await response.text();
  const doc = new JSDOM(html, { url });
  const reader = new Readability(doc.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error("Failed to parse article (article was null)");
  }

  if (!article.content) {
    throw new Error("Failed to extract content (article.content was null)");
  }

  const renderedHtml = article.content.replace(/\n\s*/g, "");
  const rawText = documentContentToPlainText(article.textContent || renderedHtml);

  return {
    title: article.title || "Title not found",
    content: renderedHtml,
    renderedHtml,
    rawText,
    sourceType: "url",
    sourceName: undefined,
    sourceMimeType: response.headers.get("content-type") ?? undefined,
    originalUrl: url,
    original_url: url,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeHumanText(value: string) {
  const normalized = value.replace(/\+/g, " ").trim();

  if (!normalized) {
    return "";
  }

  try {
    return decodeURIComponent(normalized).trim();
  } catch {
    return normalized;
  }
}

function cleanPdfTitle(value: string | undefined | null) {
  if (!value) {
    return "";
  }

  return decodeHumanText(value)
    .replace(/^['"\s]+|['"\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getReadablePdfTitle(params: { metadataTitle?: string | null; fileName: string }) {
  const metadataTitle = cleanPdfTitle(params.metadataTitle);

  if (metadataTitle && !/^untitled$/i.test(metadataTitle)) {
    return metadataTitle;
  }

  const fileNameWithoutExtension = params.fileName.replace(/\.pdf$/i, "");
  const fileTitle = cleanPdfTitle(fileNameWithoutExtension);
  return fileTitle || "Untitled PDF";
}

function isSeparatorLine(line: string) {
  return /^[-=_*]{3,}$/.test(line.trim());
}

function isListItemLine(line: string) {
  return /^(?:[-*•]|\d+[\.)])\s+/.test(line.trim());
}

function isHeadingLine(line: string) {
  const text = line.trim();

  if (!text || text.length > 90 || text.split(/\s+/).length > 12) {
    return false;
  }

  if (/[.!?;:]$/.test(text)) {
    return false;
  }

  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  const uppercaseLetters = letters.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, "");
  const uppercaseRatio = letters.length > 0 ? uppercaseLetters.length / letters.length : 0;

  return uppercaseRatio >= 0.6 || /^\d+(?:\.\d+)*\s+\S+/.test(text);
}

function rawTextToRenderedHtml(rawText: string) {
  const blocks = rawText
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return "<p></p>";
  }

  const renderedBlocks = blocks.map((block) => {
    const lines = block
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return "";
    }

    const firstLine = lines[0];

    if (lines.length === 1 && firstLine && isSeparatorLine(firstLine)) {
      return "<hr />";
    }

    if (lines.length === 1 && firstLine && isHeadingLine(firstLine)) {
      return `<h2>${escapeHtml(firstLine)}</h2>`;
    }

    if (lines.every(isListItemLine)) {
      const items = lines
        .map((line) => line.replace(/^(?:[-*•]|\d+[\.)])\s+/, "").trim())
        .filter(Boolean)
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join("");

      return `<ul>${items}</ul>`;
    }

    const htmlParagraphs = lines
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join("");

    return htmlParagraphs;
  });

  return renderedBlocks.join("") || "<p></p>";
}

function buildFileSourceReference(fileName: string) {
  return `file:${encodeURIComponent(fileName)}`;
}

export async function ingestPdfFile(file: File): Promise<ProcessedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const parser = new PDFParse({ data: Buffer.from(arrayBuffer) });
  let pdfText;
  let pdfInfo;

  try {
    pdfText = await parser.getText();
    pdfInfo = await parser.getInfo();
  } finally {
    await parser.destroy();
  }

  const rawText = documentContentToPlainText(pdfText.text || "");

  if (!rawText) {
    throw new Error("No text could be extracted from this PDF");
  }

  const renderedHtml = rawTextToRenderedHtml(rawText);
  const title = getReadablePdfTitle({
    metadataTitle: pdfInfo.info?.Title,
    fileName: file.name,
  });
  const sourceReference = buildFileSourceReference(file.name);

  return {
    title,
    content: renderedHtml,
    renderedHtml,
    rawText,
    sourceType: "file",
    sourceName: file.name,
    sourceMimeType: file.type || "application/pdf",
    originalUrl: sourceReference,
    original_url: sourceReference,
  };
}
