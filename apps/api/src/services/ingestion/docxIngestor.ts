import type { ProcessedDocument } from "@documind/types";
import mammoth from "mammoth";
import {
  articleHtmlToBlocks,
  renderBlocksToHtml,
  renderBlocksToRawText,
} from "../../lib/document-blocks";
import { documentContentToPlainText } from "../../lib/document-text";
import { buildFileSourceReference } from "./sourceReference";
import { getReadableDocxTitle } from "./titles";

export async function ingestDocxFile(file: File): Promise<ProcessedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const conversion = await mammoth.convertToHtml({ buffer: Buffer.from(arrayBuffer) });
  const html = conversion.value?.trim();

  if (!html) {
    throw new Error("No content could be extracted from this DOCX");
  }

  const blocks = articleHtmlToBlocks(html);
  const renderedHtml = renderBlocksToHtml(blocks);
  const rawText = renderBlocksToRawText(blocks) || documentContentToPlainText(html) || "";

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
