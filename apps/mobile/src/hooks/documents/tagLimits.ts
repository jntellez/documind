export const MAX_DOCUMENT_TAGS = 5;

export function canAddDocumentTag(currentTags: string[]) {
  return currentTags.length < MAX_DOCUMENT_TAGS;
}
