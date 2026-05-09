import type { DocumentBlock, DocumentListItem } from "@documind/types";
import { JSDOM } from "jsdom";
import { normalizeBlocks } from "./listUtils";
import { normalizeText } from "./textUtils";

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
