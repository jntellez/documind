import pg from "../../db";

let ensureIngestionColumnsPromise: Promise<void> | null = null;

export function ensureDocumentIngestionColumns() {
  if (ensureIngestionColumnsPromise) {
    return ensureIngestionColumnsPromise;
  }

  ensureIngestionColumnsPromise = (async () => {
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS rendered_html TEXT`;
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS raw_text TEXT`;
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_type TEXT`;
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_name TEXT`;
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS source_mime_type TEXT`;
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS original_url_v2 TEXT`;
    await pg`ALTER TABLE documents ADD COLUMN IF NOT EXISTS canonical_blocks JSONB`;

    await pg`
      UPDATE documents
      SET
        rendered_html = COALESCE(rendered_html, content),
        raw_text = COALESCE(raw_text, ''),
        source_type = COALESCE(source_type, 'url'),
        original_url_v2 = COALESCE(original_url_v2, original_url)
      WHERE rendered_html IS NULL
         OR raw_text IS NULL
         OR source_type IS NULL
         OR original_url_v2 IS NULL
    `;

    await pg`UPDATE documents SET raw_text = content WHERE raw_text = ''`;
  })();

  return ensureIngestionColumnsPromise;
}
