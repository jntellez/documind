export type JwtPayload = {
  sub?: string | number;
  id?: string | number;
};

export function getUserId(payload: JwtPayload) {
  return Number(payload.sub || payload.id);
}

export function parseDocumentId(value: string) {
  const documentId = Number(value);

  if (!documentId || Number.isNaN(documentId)) {
    return null;
  }

  return documentId;
}

export function toPgTextArray(tags: string[]) {
  return `{${tags.map((tag) => `"${tag.replace(/"/g, '\\"')}"`).join(",")}}`;
}
