import type { DocumentBlock, DocumentListItem } from "@documind/types";
import { normalizeBlocks, normalizeListItems, normalizeListMarker } from "./listUtils";

function renderListItemsToRawText(
  items: DocumentListItem[],
  ordered: boolean,
  depth: number,
): string {
  return items
    .map((item, index) => {
      const indent = "  ".repeat(depth);
      const marker = normalizeListMarker(item.marker);
      const prefix = marker ?? (ordered ? `${index + 1}.` : "-");
      const selfLine = `${indent}${prefix} ${item.text}`;
      const children = item.children?.length
        ? `\n${renderListItemsToRawText(item.children, ordered, depth + 1)}`
        : "";

      return `${selfLine}${children}`;
    })
    .join("\n");
}

export function renderBlocksToRawText(blocks: DocumentBlock[]) {
  const normalized = normalizeBlocks(blocks);

  return normalized
    .map((block) => {
      switch (block.type) {
        case "heading":
        case "paragraph":
          return block.text;
        case "divider":
          return "---";
        case "list":
          return renderListItemsToRawText(normalizeListItems(block.items), Boolean(block.ordered), 0);
      }
    })
    .join("\n\n")
    .trim();
}
