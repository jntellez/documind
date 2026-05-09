import pg from "../db";

export async function insertDocument(tx: any, params: {
  title: string;
  content: string;
  renderedHtml: string;
  rawText: string;
  sourceType: string;
  sourceName: string | null;
  sourceMimeType: string | null;
  blocks: unknown[] | undefined;
  originalUrl: string;
  originalUrlLegacy: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  tagsPgFormat: string;
}) {
  return tx`
    INSERT INTO documents (
      title,
      content,
      rendered_html,
      raw_text,
      source_type,
      source_name,
      source_mime_type,
      canonical_blocks,
      original_url_v2,
      original_url,
      word_count,
      created_at,
      updated_at,
      user_id,
      tags
    )
    VALUES (
      ${params.title},
      ${params.content},
      ${params.renderedHtml},
      ${params.rawText},
      ${params.sourceType},
      ${params.sourceName},
      ${params.sourceMimeType},
      ${params.blocks ? JSON.stringify(params.blocks) : null}::jsonb,
      ${params.originalUrl},
      ${params.originalUrlLegacy},
      ${params.wordCount},
      ${params.createdAt},
      ${params.updatedAt},
      ${params.userId},
      ${params.tagsPgFormat}
    )
    RETURNING id, title, content, rendered_html, raw_text, canonical_blocks, source_type, source_name, source_mime_type, original_url_v2, original_url, word_count, created_at, updated_at, tags
  `;
}

export async function listDocumentsByUser(userId: number) {
  return pg`
    SELECT
      id,
      title,
      content,
      COALESCE(rendered_html, content) AS rendered_html,
      COALESCE(raw_text, content) AS raw_text,
      COALESCE(source_type, 'url') AS source_type,
      source_name,
      source_mime_type,
      canonical_blocks,
      COALESCE(original_url_v2, original_url) AS original_url_v2,
      original_url,
      word_count,
      created_at,
      updated_at,
      tags
    FROM documents
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
}

export async function getDocumentByIdForUser(documentId: number, userId: number) {
  return pg`
    SELECT
      id,
      title,
      content,
      COALESCE(rendered_html, content) AS rendered_html,
      COALESCE(raw_text, content) AS raw_text,
      COALESCE(source_type, 'url') AS source_type,
      source_name,
      source_mime_type,
      canonical_blocks,
      COALESCE(original_url_v2, original_url) AS original_url_v2,
      original_url,
      word_count,
      created_at,
      updated_at,
      tags
    FROM documents
    WHERE id = ${documentId} AND user_id = ${userId}
  `;
}

export async function getRawDocumentByIdForUser(documentId: number, userId: number) {
  return pg`
    SELECT * FROM documents
    WHERE id = ${documentId} AND user_id = ${userId}
  `;
}

export async function updateDocumentByIdForUser(tx: any, params: {
  documentId: number;
  userId: number;
  title: string;
  content: string;
  renderedHtml: string;
  rawText: string;
  sourceType: string;
  sourceName: string | null;
  sourceMimeType: string | null;
  blocks: unknown;
  originalUrl: string;
  tagsPgFormat: string;
  wordCount: number;
  updatedAt: Date;
}) {
  return tx`
    UPDATE documents
    SET
      title = ${params.title},
      content = ${params.content},
      rendered_html = ${params.renderedHtml},
      raw_text = ${params.rawText},
      source_type = ${params.sourceType},
      source_name = ${params.sourceName},
      source_mime_type = ${params.sourceMimeType},
      canonical_blocks = ${params.blocks ? JSON.stringify(params.blocks) : null}::jsonb,
      original_url_v2 = ${params.originalUrl},
      tags = ${params.tagsPgFormat},
      word_count = ${params.wordCount},
      updated_at = ${params.updatedAt}
    WHERE id = ${params.documentId} AND user_id = ${params.userId}
    RETURNING id, title, content, rendered_html, raw_text, canonical_blocks, source_type, source_name, source_mime_type, original_url_v2, original_url, word_count, created_at, updated_at, tags
  `;
}

export async function deleteDocumentByIdForUser(documentId: number, userId: number) {
  return pg`
    DELETE FROM documents
    WHERE id = ${documentId} AND user_id = ${userId}
    RETURNING id
  `;
}
