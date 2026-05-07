const BLOCK_TAG_BREAK = /<\s*\/?\s*(h[1-6]|p|div|section|article|header|footer|blockquote|pre|tr|table|ul|ol)\b[^>]*>/gi;
const LIST_ITEM_BREAK = /<\s*\/?\s*li\b[^>]*>/gi;
const CELL_BREAK = /<\s*\/?\s*(td|th)\b[^>]*>/gi;
const LINE_BREAK_TAG = /<\s*br\s*\/?>/gi;

const namedEntities: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&hellip;': '…',
  '&ndash;': '–',
  '&mdash;': '—',
};

function decodeHtmlEntities(value: string): string {
  const withNamed = Object.entries(namedEntities).reduce(
    (acc, [entity, decoded]) => acc.replace(new RegExp(entity, 'gi'), decoded),
    value,
  );

  const withDecimalEntities = withNamed.replace(/&#(\d+);/g, (_match, decimalCode) => {
    const code = Number.parseInt(decimalCode, 10);

    if (Number.isNaN(code)) {
      return _match;
    }

    return String.fromCodePoint(code);
  });

  return withDecimalEntities.replace(/&#x([0-9a-fA-F]+);/g, (_match, hexCode) => {
    const code = Number.parseInt(hexCode, 16);

    if (Number.isNaN(code)) {
      return _match;
    }

    return String.fromCodePoint(code);
  });
}

export function documentToPlainText(content: string | null): string {
  if (!content) {
    return '';
  }

  const withoutScriptsAndStyles = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');

  const withSpacingHints = withoutScriptsAndStyles
    .replace(LINE_BREAK_TAG, '\n')
    .replace(BLOCK_TAG_BREAK, '\n')
    .replace(LIST_ITEM_BREAK, '\n• ')
    .replace(CELL_BREAK, ' | ');

  const withoutTags = withSpacingHints.replace(/<[^>]+>/g, ' ');
  const decodedEntities = decodeHtmlEntities(withoutTags);

  return decodedEntities
    .replace(/\r\n/g, '\n')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s*\|\s*/g, ' | ')
    .trim();
}

export function buildDocumentSpeechText(params: { title?: string | null; content: string | null }): string {
  const title = params.title?.trim() ?? '';
  const body = documentToPlainText(params.content);

  if (!title) {
    return body;
  }

  if (!body) {
    return title;
  }

  return `${title}.\n\n${body}`;
}
