import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { documentContentToPlainText } from "../../lib/document-text";

export type PdfLayoutLine = {
  text: string;
  x: number;
  y: number;
  height: number;
};

function toNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function buildTextFromLayoutLines(linesByPage: PdfLayoutLine[][]) {
  const allLines: string[] = [];

  linesByPage.forEach((lines, pageIndex) => {
    let previousY: number | null = null;
    let previousHeight = 0;

    lines.forEach((line) => {
      const normalized = documentContentToPlainText(line.text);

      if (!normalized) {
        return;
      }

      if (previousY !== null) {
        const gap = Math.abs(previousY - line.y);
        const threshold = Math.max(previousHeight, line.height, 8) * 1.6;

        if (gap > threshold) {
          allLines.push("");
        }
      }

      allLines.push(normalized);
      previousY = line.y;
      previousHeight = line.height;
    });

    if (pageIndex < linesByPage.length - 1) {
      allLines.push("");
    }
  });

  return allLines.join("\n").trim();
}

export async function extractPdfLayoutAndMetadata(arrayBuffer: ArrayBuffer) {
  const pdf = await getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: false,
  }).promise;

  try {
    const linesByPage: PdfLayoutLine[][] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const tolerance = 3;
      const linesMap = new Map<number, PdfLayoutLine[]>();

      for (const item of textContent.items) {
        if (!("str" in item)) {
          continue;
        }

        const text = item.str?.trim();

        if (!text) {
          continue;
        }

        const transform = item.transform ?? [];
        const x = toNumber(transform[4], 0);
        const y = toNumber(transform[5], 0);
        const key = Math.round(y / tolerance) * tolerance;
        const lineItems = linesMap.get(key) ?? [];
        lineItems.push({
          text,
          x,
          y,
          height: toNumber(item.height, 0),
        });
        linesMap.set(key, lineItems);
      }

      const lines = Array.from(linesMap.values())
        .map((lineItems) => {
          const sortedItems = lineItems.sort((a, b) => a.x - b.x);
          const lineText = sortedItems.map((entry) => entry.text).join(" ").replace(/\s+/g, " ").trim();
          const first = sortedItems[0];
          return {
            text: lineText,
            x: first?.x ?? 0,
            y: first?.y ?? 0,
            height: Math.max(...sortedItems.map((entry) => entry.height), 0),
          };
        })
        .filter((line) => line.text.length > 0)
        .sort((a, b) => (Math.abs(a.y - b.y) <= tolerance ? a.x - b.x : b.y - a.y));

      linesByPage.push(lines);
    }

    const metadata = await pdf.getMetadata().catch(() => null);
    const metadataInfo = metadata?.info as { Title?: string } | undefined;

    return {
      linesByPage,
      metadataTitle: metadataInfo?.Title,
    };
  } finally {
    await pdf.destroy();
  }
}
