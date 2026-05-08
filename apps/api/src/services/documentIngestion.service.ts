import { Readability } from "@mozilla/readability";
import type { ProcessedDocument } from "@documind/types";
import { JSDOM } from "jsdom";
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
