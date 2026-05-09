import type { DocumentBlock, DocumentListItem } from "@documind/types";
import { isLikelyHeadingLine, isSeparatorLine, mergeParagraphLines } from "./textUtils";

export const BULLET_MARKER_PATTERN = "[-*•●◦▪▫‣∙·o�]";
export const ORDERED_MARKER_PATTERN = "\\d+[\\.)]";

export type ParsedListItem = {
  ordered: boolean;
  marker: string;
  markerValue: number | null;
  indent: number;
  text: string;
};

type BuildingListItem = ParsedListItem & {
  children: BuildingListItem[];
};

function leadingWhitespaceWidth(line: string) {
  const leading = line.match(/^\s*/)?.[0] ?? "";
  let width = 0;

  for (const char of leading) {
    width += char === "\t" ? 4 : 1;
  }

  return width;
}

export function isListItemLine(line: string) {
  return new RegExp(`^(?:${BULLET_MARKER_PATTERN}|${ORDERED_MARKER_PATTERN})(?:\\s+\\S.*)?$`).test(line.trim());
}

export function normalizeListMarker(marker?: string) {
  if (!marker) {
    return undefined;
  }

  const trimmed = marker.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.toLowerCase() === "o" || trimmed === "�" || trimmed === "") {
    return "•";
  }

  return trimmed;
}

export function normalizeListItems(items: Array<DocumentListItem | string>): DocumentListItem[] {
  return items
    .map((item) => {
      if (typeof item === "string") {
        const text = item.trim();

        if (!text) {
          return null;
        }

        return { text } satisfies DocumentListItem;
      }

      const text = item.text?.trim() ?? "";

      if (!text) {
        return null;
      }

      const children = item.children ? normalizeListItems(item.children) : undefined;

      return {
        text,
        marker: normalizeListMarker(item.marker),
        ...(children && children.length > 0 ? { children } : {}),
      } satisfies DocumentListItem;
    })
    .filter((item): item is DocumentListItem => item !== null);
}

export function parseListItemLine(line: string): ParsedListItem | null {
  const indent = leadingWhitespaceWidth(line);
  const trimmed = line.trim();
  const match = trimmed.match(
    new RegExp(`^(?<marker>${BULLET_MARKER_PATTERN}|${ORDERED_MARKER_PATTERN})(?:\\s+(?<text>\\S.*))?$`),
  );

  if (!match || !match.groups) {
    return null;
  }

  const marker = match.groups.marker ?? "";
  const markerValueMatch = marker.match(/^(\d+)[\.)]$/);
  const markerValue = markerValueMatch ? Number(markerValueMatch[1]) : null;

  return {
    ordered: /^\d+[\.)]$/.test(marker),
    marker,
    markerValue: Number.isFinite(markerValue) ? markerValue : null,
    indent,
    text: match.groups.text?.trim() ?? "",
  };
}

export function shouldContinueListItem(line: string, lastItemText: string) {
  const text = line.trim();

  if (!text || isSeparatorLine(text) || isListItemLine(text) || isLikelyHeadingLine(text, isListItemLine)) {
    return false;
  }

  if (!lastItemText) {
    return true;
  }

  if (/^[a-záéíóúüñ0-9(\[\{"'“]/.test(text)) {
    return true;
  }

  return /^[,.;:)%\]}]/.test(text);
}

export function toDocumentListItems(items: ParsedListItem[]): DocumentListItem[] {
  if (items.length === 0) {
    return [];
  }

  const listIndentStep = 2;
  const baseIndent = Math.min(...items.map((item) => item.indent));
  const root: BuildingListItem = {
    ordered: false,
    marker: "",
    markerValue: null,
    indent: baseIndent - listIndentStep,
    text: "",
    children: [],
  };
  const stack: BuildingListItem[] = [root];

  items.forEach((item) => {
    const normalizedIndent = item.indent < baseIndent ? baseIndent : item.indent;
    const node: BuildingListItem = {
      ...item,
      marker: normalizeListMarker(item.marker) ?? item.marker,
      indent: normalizedIndent,
      text: item.text.trim(),
      children: [],
    };

    while (stack.length > 1 && normalizedIndent <= stack[stack.length - 1]!.indent) {
      stack.pop();
    }

    stack[stack.length - 1]!.children.push(node);
    stack.push(node);
  });

  const convert = (nodes: BuildingListItem[]): DocumentListItem[] => {
    return nodes
      .map((node): DocumentListItem | null => {
        if (!node.text) {
          return null;
        }

        const children = convert(node.children);
        const marker = normalizeListMarker(node.marker);

        return {
          text: node.text,
          ...(marker ? { marker } : {}),
          ...(children.length > 0 ? { children } : {}),
        };
      })
      .filter((node): node is DocumentListItem => node !== null);
  };

  return convert(root.children);
}

export function continueListItemText(current: string, next: string) {
  return mergeParagraphLines([current, next]).trim();
}

export function normalizeBlocks(blocks: DocumentBlock[]) {
  return blocks.filter((block) => {
    if (block.type === "paragraph" || block.type === "heading") {
      return block.text.trim().length > 0;
    }

    if (block.type === "list") {
      const normalizedItems = normalizeListItems(block.items);
      block.items = normalizedItems;
      return normalizedItems.length > 0;
    }

    return true;
  });
}
