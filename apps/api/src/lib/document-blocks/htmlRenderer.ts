import type { DocumentBlock, DocumentListItem } from "@documind/types";
import { normalizeBlocks, normalizeListItems, normalizeListMarker } from "./listUtils";
import { escapeHtml } from "./textUtils";

function renderListItemsToHtml(
  items: DocumentListItem[],
  ordered: boolean,
  depth = 0,
): string {
  return items
    .map((item, index) => {
      const marker = normalizeListMarker(item.marker) ?? (ordered ? `${index + 1}.` : "•");
      const margin = depth * 22;
      const text = escapeHtml(item.text);
      const children = item.children?.length
        ? renderListItemsToHtml(item.children, false, depth + 1)
        : "";
      const isNumberedTopLevel = depth === 0 && /^\d+[\.)]$/.test(marker);
      const markerHtml = `<span>${escapeHtml(marker)}</span>`;
      const contentHtml = isNumberedTopLevel
        ? `<strong>${markerHtml} ${text}</strong>`
        : `${markerHtml} ${text}`;

      return `<p style="margin-left:${margin}px;margin-bottom:${children ? 4 : 10}px">${contentHtml}</p>${children}`;
    })
    .join("");
}

export function renderBlocksToHtml(blocks: DocumentBlock[]) {
  const normalized = normalizeBlocks(blocks);

  if (normalized.length === 0) {
    return "<p></p>";
  }

  return normalized
    .map((block) => {
      switch (block.type) {
        case "heading": {
          const level = block.level && block.level >= 1 && block.level <= 6 ? block.level : 2;
          return `<h${level}>${escapeHtml(block.text)}</h${level}>`;
        }
        case "paragraph":
          return `<p>${escapeHtml(block.text)}</p>`;
        case "divider":
          return "<hr />";
        case "list": {
          return renderListItemsToHtml(normalizeListItems(block.items), Boolean(block.ordered));
        }
      }
    })
    .join("");
}
