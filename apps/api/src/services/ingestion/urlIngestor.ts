import { Readability } from "@mozilla/readability";
import type { ProcessedDocument } from "@documind/types";
import { JSDOM } from "jsdom";
import {
  articleHtmlToBlocks,
  renderBlocksToHtml,
  renderBlocksToRawText,
} from "../../lib/document-blocks";
import { documentContentToPlainText } from "../../lib/document-text";

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
