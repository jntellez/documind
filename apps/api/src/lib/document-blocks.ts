import type { DocumentBlock, DocumentListItem } from "@documind/types";
import { JSDOM } from "jsdom";

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSeparatorLine(line: string) {
  return /^[-=_*]{3,}$/.test(line.trim());
}

const BULLET_MARKER_PATTERN = "[-*•●◦▪▫‣∙·o�]";
const ORDERED_MARKER_PATTERN = "\\d+[\\.)]";

function leadingWhitespaceWidth(line: string) {
  const leading = line.match(/^\s*/)?.[0] ?? "";
  let width = 0;

  for (const char of leading) {
    width += char === "\t" ? 4 : 1;
  }

  return width;
}

function isListItemLine(line: string) {
  return new RegExp(`^(?:${BULLET_MARKER_PATTERN}|${ORDERED_MARKER_PATTERN})(?:\\s+\\S.*)?$`).test(line.trim());
}

function normalizeListMarker(marker?: string) {
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

function normalizeListItems(items: Array<DocumentListItem | string>): DocumentListItem[] {
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

type ParsedListItem = {
  ordered: boolean;
  marker: string;
  markerValue: number | null;
  indent: number;
  text: string;
};

type BuildingListItem = ParsedListItem & {
  children: BuildingListItem[];
};

function parseListItemLine(line: string): ParsedListItem | null {
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

function shouldContinueListItem(line: string, lastItemText: string) {
  const text = line.trim();

  if (!text || isSeparatorLine(text) || isListItemLine(text) || isLikelyHeadingLine(text)) {
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

function isHeadingLine(line: string) {
  const text = line.trim();

  if (!text || text.length > 90 || text.split(/\s+/).length > 12) {
    return false;
  }

  if (/[.!?;:]$/.test(text)) {
    return false;
  }

  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  const uppercaseLetters = letters.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, "");
  const uppercaseRatio = letters.length > 0 ? uppercaseLetters.length / letters.length : 0;

  return uppercaseRatio >= 0.6 || /^\d+(?:\.\d+)*\s+\S+/.test(text);
}

function inferHeadingLevel(line: string): 1 | 2 | 3 | 4 | 5 | 6 {
  const text = line.trim();
  const numbered = text.match(/^(\d+(?:\.\d+){0,5})[\)\.]?\s+/);

  if (!numbered) {
    return 2;
  }

  const sectionNumber = numbered[1];

  if (!sectionNumber) {
    return 2;
  }

  const depth = sectionNumber.split(".").length;

  return Math.max(1, Math.min(6, depth + 1)) as 1 | 2 | 3 | 4 | 5 | 6;
}

function isLikelyHeadingLine(line: string) {
  const text = line.trim();

  if (!text || text.length > 100 || text.split(/\s+/).length > 14) {
    return false;
  }

  if (isListItemLine(text) || isSeparatorLine(text)) {
    return false;
  }

  if (/^[\d\s.,;:!?()\[\]-]+$/.test(text)) {
    return false;
  }

  const hasTerminalPunctuation = /[.!?;:]$/.test(text);
  const numberedHeading = /^\d+(?:\.\d+){1,5}[\)\.]?\s+\S+/.test(text);
  const shortNumberedHeading = /^\d+[\)\.]\s+\S+/.test(text);

  if (numberedHeading || shortNumberedHeading) {
    return true;
  }

  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  const uppercaseLetters = letters.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, "");
  const uppercaseRatio = letters.length > 0 ? uppercaseLetters.length / letters.length : 0;
  const looksStrictTitleCase = /^([A-ZÁÉÍÓÚÜÑ][^\s]*)(\s+[A-ZÁÉÍÓÚÜÑ][^\s]*)*$/.test(text);
  const words = text.split(/\s+/);
  const lowerJoiners = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "by",
    "de",
    "del",
    "des",
    "do",
    "el",
    "en",
    "for",
    "in",
    "la",
    "las",
    "los",
    "of",
    "or",
    "the",
    "to",
    "un",
    "una",
    "y",
  ]);

  const looksLooseTitleCase =
    words.length >= 2 &&
    words.every((word, index) => {
      const normalizedWord = word.replace(/^[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+|[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/g, "");

      if (!normalizedWord) {
        return true;
      }

      const lower = normalizedWord.toLowerCase();

      if (index > 0 && lowerJoiners.has(lower)) {
        return true;
      }

      return /^[A-ZÁÉÍÓÚÜÑ]/.test(normalizedWord);
    });

  if (hasTerminalPunctuation) {
    return false;
  }

  return uppercaseRatio >= 0.65 || looksStrictTitleCase || looksLooseTitleCase || isHeadingLine(text);
}

function isShortStandaloneTitleLine(line: string) {
  const text = line.trim();

  if (!text || text.length > 70 || text.split(/\s+/).length > 8) {
    return false;
  }

  if (/[.!?;:]$/.test(text) || isListItemLine(text) || isSeparatorLine(text)) {
    return false;
  }

  return isLikelyHeadingLine(text);
}

function mergeParagraphLines(lines: string[]) {
  return lines.reduce((acc, current) => {
    if (!acc) {
      return current;
    }

    if (acc.endsWith("-") && /^[a-záéíóúüñ]/.test(current)) {
      return `${acc.slice(0, -1)}${current}`;
    }

    return `${acc} ${current}`;
  }, "");
}

function normalizeBlocks(blocks: DocumentBlock[]) {
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

export function renderBlocksToRawText(blocks: DocumentBlock[]) {
  const normalized = normalizeBlocks(blocks);

  const renderListItemsToRawText = (
    items: DocumentListItem[],
    ordered: boolean,
    depth: number,
  ): string => {
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
  };

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

export function articleHtmlToBlocks(html: string) {
  const dom = new JSDOM(`<article>${html}</article>`);
  const article = dom.window.document.querySelector("article");

  if (!article) {
    return [] as DocumentBlock[];
  }

  const blocks: DocumentBlock[] = [];
  const listHandled = new WeakSet<Element>();

  const extractListItemText = (item: Element) => {
    const parts: string[] = [];

    item.childNodes.forEach((child) => {
      if (child.nodeType === child.ELEMENT_NODE) {
        const element = child as Element;

        if (element.tagName === "UL" || element.tagName === "OL") {
          return;
        }
      }

      const text = normalizeText(child.textContent || "");

      if (text) {
        parts.push(text);
      }
    });

    return normalizeText(parts.join(" "));
  };

  const parseHtmlList = (listElement: Element): DocumentListItem[] => {
    return Array.from(listElement.querySelectorAll(":scope > li"))
      .map((li) => {
        const text = extractListItemText(li);

        if (!text) {
          return null;
        }

        const nestedList = Array.from(li.children).find(
          (child) => child.tagName === "UL" || child.tagName === "OL",
        );
        const children = nestedList ? parseHtmlList(nestedList) : undefined;

        return {
          text,
          ...(children && children.length > 0 ? { children } : {}),
        } satisfies DocumentListItem;
      })
      .filter((item): item is DocumentListItem => item !== null);
  };

  const selector = "h1,h2,h3,h4,h5,h6,p,li,hr";
  article.querySelectorAll(selector).forEach((node) => {
    if (node.tagName === "HR") {
      blocks.push({ type: "divider" });
      return;
    }

    if (node.tagName === "LI") {
      const parent = node.parentElement;

      if (!parent || (parent.tagName !== "UL" && parent.tagName !== "OL") || listHandled.has(parent)) {
        return;
      }

      listHandled.add(parent);

      const items = parseHtmlList(parent);

      if (items.length > 0) {
        blocks.push({ type: "list", ordered: parent.tagName === "OL", items });
      }

      return;
    }

    const text = normalizeText(node.textContent || "");

    if (!text) {
      return;
    }

    if (/^H[1-6]$/.test(node.tagName)) {
      const level = Number(node.tagName.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push({ type: "heading", level, text });
      return;
    }

    blocks.push({ type: "paragraph", text });
  });

  return normalizeBlocks(blocks);
}

export function rawTextToBlocks(rawText: string) {
  const result: DocumentBlock[] = [];

  const lines = rawText.split(/\r?\n/);
  let paragraphBuffer: string[] = [];
  let listBuffer: ParsedListItem[] = [];
  const listIndentStep = 2;

  const toDocumentListItems = (items: ParsedListItem[]): DocumentListItem[] => {
    if (items.length === 0) {
      return [];
    }

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
  };

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
      if (isLikelyHeadingLine(line)) {
        flushList();
        result.push({ type: "heading", level: inferHeadingLevel(line), text: line });
        return;
      }

      const lastItem = listBuffer[listBuffer.length - 1];

      if (lastItem && shouldContinueListItem(line, lastItem.text)) {
        lastItem.text = mergeParagraphLines([lastItem.text, line]).trim();
        return;
      }

      flushList();
    }

    if (paragraphBuffer.length > 0 && isShortStandaloneTitleLine(line)) {
      flushParagraph();
      result.push({ type: "heading", level: inferHeadingLevel(line), text: line });
      return;
    }

    if (isLikelyHeadingLine(line)) {
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
