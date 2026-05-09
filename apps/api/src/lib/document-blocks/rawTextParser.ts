import type { DocumentBlock } from "@documind/types";
import {
  continueListItemText,
  isListItemLine,
  normalizeBlocks,
  parseListItemLine,
  shouldContinueListItem,
  toDocumentListItems,
  type ParsedListItem,
} from "./listUtils";
import {
  inferHeadingLevel,
  isLikelyHeadingLine,
  isSeparatorLine,
  isShortStandaloneTitleLine,
  mergeParagraphLines,
} from "./textUtils";

export function rawTextToBlocks(rawText: string) {
  const result: DocumentBlock[] = [];

  const lines = rawText.split(/\r?\n/);
  let paragraphBuffer: string[] = [];
  let listBuffer: ParsedListItem[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }

    const text = mergeParagraphLines(paragraphBuffer).trim();

    if (text) {
      result.push({ type: "paragraph", text });
    }

    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listBuffer.length === 0) {
      return;
    }

    const ordered = listBuffer[0]?.ordered ?? false;
    const items = toDocumentListItems(listBuffer);

    if (items.length > 0) {
      result.push({ type: "list", ordered, items });
    }

    listBuffer = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      flushParagraph();
      return;
    }

    if (isSeparatorLine(line)) {
      flushList();
      flushParagraph();
      result.push({ type: "divider" });
      return;
    }

    if (isListItemLine(line)) {
      flushParagraph();

      const parsedItem = parseListItemLine(rawLine);

      if (!parsedItem) {
        return;
      }

      if (listBuffer.length > 0 && listBuffer[0]?.ordered !== parsedItem.ordered) {
        flushList();
      }

      listBuffer.push(parsedItem);
      return;
    }

    if (listBuffer.length > 0) {
      if (isLikelyHeadingLine(line, isListItemLine)) {
        flushList();
        result.push({ type: "heading", level: inferHeadingLevel(line), text: line });
        return;
      }

      const lastItem = listBuffer[listBuffer.length - 1];

      if (lastItem && shouldContinueListItem(line, lastItem.text)) {
        lastItem.text = continueListItemText(lastItem.text, line);
        return;
      }

      flushList();
    }

    if (paragraphBuffer.length > 0 && isShortStandaloneTitleLine(line, isListItemLine)) {
      flushParagraph();
      result.push({ type: "heading", level: inferHeadingLevel(line), text: line });
      return;
    }

    if (isLikelyHeadingLine(line, isListItemLine)) {
      flushParagraph();
      result.push({ type: "heading", level: inferHeadingLevel(line), text: line });
      return;
    }

    paragraphBuffer.push(line);
  });

  flushList();
  flushParagraph();

  return normalizeBlocks(result);
}
