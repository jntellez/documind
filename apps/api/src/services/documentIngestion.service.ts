import { Readability } from "@mozilla/readability";
import type { ProcessedDocument } from "@documind/types";
import { JSDOM } from "jsdom";
import mammoth from "mammoth";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import pg from "../db";
import {
  articleHtmlToBlocks,
  rawTextToBlocks,
  renderBlocksToHtml,
  renderBlocksToRawText,
} from "../lib/document-blocks";
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
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS canonical_blocks JSONB`;

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

  const articleHtml = article.content.replace(/\n\s*/g, "");
  const blocks = articleHtmlToBlocks(articleHtml);
  const renderedHtml = renderBlocksToHtml(blocks);
  const rawText = renderBlocksToRawText(blocks) || documentContentToPlainText(article.textContent || articleHtml);

  return {
    title: article.title || "Title not found",
    content: renderedHtml,
    renderedHtml,
    rawText,
    blocks,
    sourceType: "url",
    sourceName: undefined,
    sourceMimeType: response.headers.get("content-type") ?? undefined,
    originalUrl: url,
    original_url: url,
  };
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

function buildFileSourceReference(fileName: string) {
  return `file:${encodeURIComponent(fileName)}`;
}

function getReadableDocxTitle(fileName: string) {
  const fileNameWithoutExtension = fileName.replace(/\.docx$/i, "");
  const fileTitle = cleanPdfTitle(fileNameWithoutExtension);
  return fileTitle || "Untitled DOCX";
}

type PdfLayoutLine = {
  text: string;
  x: number;
  y: number;
  height: number;
};

function toNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function buildTextFromLayoutLines(linesByPage: PdfLayoutLine[][]) {
  const allLines: string[] = [];

  linesByPage.forEach((lines, pageIndex) => {
    let previousY: number | null = null;
    let previousHeight = 0;

    lines.forEach((line) => {
      const normalized = documentContentToPlainText(line.text);

      if (!normalized) {
        return;
      }

      if (previousY !== null) {
        const gap = Math.abs(previousY - line.y);
        const threshold = Math.max(previousHeight, line.height, 8) * 1.6;

        if (gap > threshold) {
          allLines.push("");
        }
      }

      allLines.push(normalized);
      previousY = line.y;
      previousHeight = line.height;
    });

    if (pageIndex < linesByPage.length - 1) {
      allLines.push("");
    }
  });

  return allLines.join("\n").trim();
}

async function extractPdfLayoutAndMetadata(arrayBuffer: ArrayBuffer) {
  const pdf = await getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: false,
  }).promise;

  try {
    const linesByPage: PdfLayoutLine[][] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const tolerance = 3;
      const linesMap = new Map<number, PdfLayoutLine[]>();

      for (const item of textContent.items) {
        if (!("str" in item)) {
          continue;
        }

        const text = item.str?.trim();

        if (!text) {
          continue;
        }

        const transform = item.transform ?? [];
        const x = toNumber(transform[4], 0);
        const y = toNumber(transform[5], 0);
        const key = Math.round(y / tolerance) * tolerance;
        const lineItems = linesMap.get(key) ?? [];
        lineItems.push({
          text,
          x,
          y,
          height: toNumber(item.height, 0),
        });
        linesMap.set(key, lineItems);
      }

      const lines = Array.from(linesMap.values())
        .map((lineItems) => {
          const sortedItems = lineItems.sort((a, b) => a.x - b.x);
          const lineText = sortedItems.map((entry) => entry.text).join(" ").replace(/\s+/g, " ").trim();
          const first = sortedItems[0];
          return {
            text: lineText,
            x: first?.x ?? 0,
            y: first?.y ?? 0,
            height: Math.max(...sortedItems.map((entry) => entry.height), 0),
          };
        })
        .filter((line) => line.text.length > 0)
        .sort((a, b) => (Math.abs(a.y - b.y) <= tolerance ? a.x - b.x : b.y - a.y));

      linesByPage.push(lines);
    }

    const metadata = await pdf.getMetadata().catch(() => null);
    const metadataInfo = metadata?.info as { Title?: string } | undefined;

    return {
      linesByPage,
      metadataTitle: metadataInfo?.Title,
    };
  } finally {
    await pdf.destroy();
  }
}

export async function ingestPdfFile(file: File): Promise<ProcessedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const { linesByPage, metadataTitle } = await extractPdfLayoutAndMetadata(arrayBuffer);
  const rawText = buildTextFromLayoutLines(linesByPage);

  if (!rawText) {
    throw new Error("No text could be extracted from this PDF");
  }

  const blocks = rawTextToBlocks(rawText);
  const renderedHtml = renderBlocksToHtml(blocks);
  const normalizedRawText = renderBlocksToRawText(blocks) || rawText;
  const title = getReadablePdfTitle({
    metadataTitle,
    fileName: file.name,
  });
  const sourceReference = buildFileSourceReference(file.name);

  return {
    title,
    content: renderedHtml,
    renderedHtml,
    rawText: normalizedRawText,
    blocks,
    sourceType: "file",
    sourceName: file.name,
    sourceMimeType: file.type || "application/pdf",
    originalUrl: sourceReference,
    original_url: sourceReference,
  };
}

export async function ingestDocxFile(file: File): Promise<ProcessedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const conversion = await mammoth.convertToHtml({ buffer: Buffer.from(arrayBuffer) });
  const html = conversion.value?.trim();

  if (!html) {
    throw new Error("No content could be extracted from this DOCX");
  }

  const blocks = articleHtmlToBlocks(html);
  const renderedHtml = renderBlocksToHtml(blocks);
  const rawText =
    renderBlocksToRawText(blocks) || documentContentToPlainText(html) || "";

  if (!rawText.trim()) {
    throw new Error("No text could be extracted from this DOCX");
  }

  const title = getReadableDocxTitle(file.name);
  const sourceReference = buildFileSourceReference(file.name);

  return {
    title,
    content: renderedHtml,
    renderedHtml,
    rawText,
    blocks,
    sourceType: "file",
    sourceName: file.name,
    sourceMimeType:
      file.type ||
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    originalUrl: sourceReference,
    original_url: sourceReference,
  };
}
