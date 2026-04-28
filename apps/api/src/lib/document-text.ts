import { JSDOM } from "jsdom";

const BLOCK_SELECTOR = [
  "address",
  "article",
  "aside",
  "blockquote",
  "div",
  "dl",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "td",
  "th",
  "tr",
  "ul",
].join(",");

function normalizeText(value: string) {
  return value
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function looksLikeHtml(value: string) {
  return /<[^>]+>/.test(value);
}

export function documentContentToPlainText(content: string) {
  if (!content.trim()) {
    return "";
  }

  if (!looksLikeHtml(content)) {
    return normalizeText(content);
  }

  const dom = new JSDOM(content);
  const { document } = dom.window;

  document.querySelectorAll("script, style, noscript").forEach((node) => node.remove());
  document.querySelectorAll("br").forEach((node) => {
    node.replaceWith(document.createTextNode("\n"));
  });
  document.querySelectorAll(BLOCK_SELECTOR).forEach((node) => {
    node.append(document.createTextNode("\n\n"));
  });

  return normalizeText(document.body?.textContent ?? document.documentElement.textContent ?? content);
}

export function countWords(content: string) {
  const text = documentContentToPlainText(content);

  if (!text) {
    return 0;
  }

  return text.split(/\s+/).filter(Boolean).length;
}

export type TextChunk = {
  chunkIndex: number;
  content: string;
  tokenCount: number;
};

function splitLongParagraph(paragraph: string, maxChars: number) {
  const words = paragraph.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (current && next.length > maxChars) {
      chunks.push(current);
      current = word;
      continue;
    }

    current = next;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

export function splitTextIntoChunks(text: string, targetChars = 1200, maxChars = 1500) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return [] as TextChunk[];
  }

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .flatMap((paragraph) =>
      paragraph.length > maxChars ? splitLongParagraph(paragraph, maxChars) : [paragraph],
    );

  const chunks: TextChunk[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;

    if (current && next.length > targetChars) {
      chunks.push({
        chunkIndex: chunks.length,
        content: current,
        tokenCount: current.split(/\s+/).filter(Boolean).length,
      });
      current = paragraph;
      continue;
    }

    current = next;
  }

  if (current) {
    chunks.push({
      chunkIndex: chunks.length,
      content: current,
      tokenCount: current.split(/\s+/).filter(Boolean).length,
    });
  }

  return chunks;
}
