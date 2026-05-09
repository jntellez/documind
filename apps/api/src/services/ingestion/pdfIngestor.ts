import type { ProcessedDocument } from "@documind/types";
import { rawTextToBlocks, renderBlocksToHtml, renderBlocksToRawText } from "../../lib/document-blocks";
import { extractPdfLayoutAndMetadata, buildTextFromLayoutLines } from "./pdfLayout";
import { buildFileSourceReference } from "./sourceReference";
import { getReadablePdfTitle } from "./titles";

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
