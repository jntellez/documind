export function serializeDocumentRow(row: any) {
  const renderedHtml = row.rendered_html ?? row.content;
  const rawText = row.raw_text ?? renderedHtml;
  const blocks = row.canonical_blocks ?? undefined;
  const sourceType = row.source_type ?? "url";
  const sourceName = row.source_name ?? undefined;
  const sourceMimeType = row.source_mime_type ?? undefined;
  const originalUrl = row.original_url_v2 ?? row.original_url ?? undefined;

  return {
    ...row,
    content: renderedHtml,
    renderedHtml,
    rawText,
    blocks,
    sourceType,
    sourceName,
    sourceMimeType,
    originalUrl,
  };
}
