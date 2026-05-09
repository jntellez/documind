export function decodeHumanText(value: string) {
  const normalized = value.replace(/\+/g, " ").trim();

  if (!normalized) {
    return "";
  }

  try {
    return decodeURIComponent(normalized).trim();
  } catch {
    return normalized;
  }
}

export function cleanPdfTitle(value: string | undefined | null) {
  if (!value) {
    return "";
  }

  return decodeHumanText(value)
    .replace(/^['"\s]+|['"\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getReadablePdfTitle(params: { metadataTitle?: string | null; fileName: string }) {
  const metadataTitle = cleanPdfTitle(params.metadataTitle);

  if (metadataTitle && !/^untitled$/i.test(metadataTitle)) {
    return metadataTitle;
  }

  const fileNameWithoutExtension = params.fileName.replace(/\.pdf$/i, "");
  const fileTitle = cleanPdfTitle(fileNameWithoutExtension);
  return fileTitle || "Untitled PDF";
}

export function getReadableDocxTitle(fileName: string) {
  const fileNameWithoutExtension = fileName.replace(/\.docx$/i, "");
  const fileTitle = cleanPdfTitle(fileNameWithoutExtension);
  return fileTitle || "Untitled DOCX";
}

export function getReadablePptxTitle(fileName: string) {
  const fileNameWithoutExtension = fileName.replace(/\.pptx$/i, "");
  const fileTitle = cleanPdfTitle(fileNameWithoutExtension);
  return fileTitle || "Untitled PPTX";
}
