import type { ProcessedDocument } from "@documind/types";
import JSZip from "jszip";
import { rawTextToBlocks, renderBlocksToHtml, renderBlocksToRawText } from "../../lib/document-blocks";
import { buildFileSourceReference } from "./sourceReference";
import { getReadablePptxTitle } from "./titles";
import { extractSlideTexts } from "./pptxText";

export async function ingestPptxFile(file: File): Promise<ProcessedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slideEntries = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .map((name) => ({
      name,
      slideNumber: Number(name.match(/slide(\d+)\.xml$/i)?.[1] ?? Number.POSITIVE_INFINITY),
    }))
    .sort((a, b) => a.slideNumber - b.slideNumber);

  if (slideEntries.length === 0) {
    throw new Error("No slides were found in this PPTX");
  }

  const title = getReadablePptxTitle(file.name);
  const lines: string[] = [title, ""];

  for (const slide of slideEntries) {
    const slideXml = await zip.file(slide.name)?.async("string");

    if (!slideXml) {
      continue;
    }

    const slideTexts = extractSlideTexts(slideXml);
    if (slideTexts.length === 0) {
      lines.push("(No text found)", "");
      continue;
    }

    const [firstLine, ...rest] = slideTexts;

    if (firstLine) {
      lines.push(firstLine);
    }

    for (const text of rest) {
      const normalized = text.replace(/\s+/g, " ").trim();

      if (!normalized) {
        continue;
      }

      if (/^[•\-–—]\s+/.test(normalized)) {
        lines.push(`- ${normalized.replace(/^[•\-–—]\s+/, "").trim()}`);
      } else {
        lines.push(normalized);
      }
    }

    lines.push("");
  }

  const rawTextInput = lines.join("\n").trim();

  if (!rawTextInput) {
    throw new Error("No text could be extracted from this PPTX");
  }

  const blocks = rawTextToBlocks(rawTextInput);
  const renderedHtml = renderBlocksToHtml(blocks);
  const rawText = renderBlocksToRawText(blocks) || rawTextInput;
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
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    originalUrl: sourceReference,
    original_url: sourceReference,
  };
}
