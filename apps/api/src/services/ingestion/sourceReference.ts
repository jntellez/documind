export function buildFileSourceReference(fileName: string) {
  return `file:${encodeURIComponent(fileName)}`;
}
