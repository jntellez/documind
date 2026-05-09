export function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isSeparatorLine(line: string) {
  return /^[-=_*]{3,}$/.test(line.trim());
}

export function isHeadingLine(line: string) {
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

export function inferHeadingLevel(line: string): 1 | 2 | 3 | 4 | 5 | 6 {
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

export function isLikelyHeadingLine(line: string, isListItemLine: (line: string) => boolean) {
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

export function isShortStandaloneTitleLine(line: string, isListItemLine: (line: string) => boolean) {
  const text = line.trim();

  if (!text || text.length > 70 || text.split(/\s+/).length > 8) {
    return false;
  }

  if (/[.!?;:]$/.test(text) || isListItemLine(text) || isSeparatorLine(text)) {
    return false;
  }

  return isLikelyHeadingLine(text, isListItemLine);
}

export function mergeParagraphLines(lines: string[]) {
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
