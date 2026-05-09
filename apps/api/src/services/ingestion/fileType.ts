export type SupportedFileType = "pdf" | "docx" | "pptx";

export function detectSupportedFileType(file: File): SupportedFileType | null {
  const mimeType = file.type || "";
  const isPdfByMime = mimeType === "application/pdf";
  const isPdfByName = /\.pdf$/i.test(file.name);
  const isDocxByMime =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isDocxByName = /\.docx$/i.test(file.name);
  const isPptxByMime =
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  const isPptxByName = /\.pptx$/i.test(file.name);

  if (isPdfByMime || isPdfByName) {
    return "pdf";
  }

  if (isDocxByMime || isDocxByName) {
    return "docx";
  }

  if (isPptxByMime || isPptxByName) {
    return "pptx";
  }

  return null;
}
