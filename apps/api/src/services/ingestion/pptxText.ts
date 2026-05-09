function decodeXmlEntities(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function isPptxXmlNoise(value: string) {
  const text = value.trim();

  return (
    /^<\/?[a-zA-Z0-9]+:/.test(text) ||
    /xmlns[:=]/.test(text) ||
    /schemas\.microsoft\.com/.test(text) ||
    /<\/?a:/.test(text) ||
    /<\/?p:/.test(text)
  );
}

function isLowQualityPptxText(value: string) {
  const text = value.trim();

  if (!text) {
    return true;
  }

  if (/^[A-ZÁÉÍÓÚÜÑ]$/i.test(text)) {
    return true;
  }

  const timeMatches = text.match(/\b\d{1,2}:\d{2}\s*(?:am|pm)\b/gi) ?? [];
  if (timeMatches.length >= 3) {
    return true;
  }

  const words = text.split(/\s+/);
  const uniqueWords = new Set(words.map((word) => word.toLowerCase()));
  if (words.length >= 8 && uniqueWords.size <= Math.max(2, Math.floor(words.length / 3))) {
    return true;
  }

  if (text.length < 16 && /^[a-záéíóúüñ]/.test(text)) {
    return true;
  }

  return false;
}

export function extractSlideTexts(slideXml: string) {
  const textRuns = Array.from(slideXml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g), (match) =>
    decodeXmlEntities(match[1] ?? "").replace(/\s+/g, " ").trim(),
  ).filter((text) => Boolean(text) && !isPptxXmlNoise(text) && !isLowQualityPptxText(text));

  return textRuns;
}
