import pg from "../db";
import {
  documentContentToPlainText,
  splitTextIntoChunks,
} from "../lib/document-text";

type DatabaseClient = typeof pg;

export type RetrievedDocumentChunk = {
  chunkIndex: number;
  content: string;
  fullTextRank: number;
  lexicalRank: number;
};

export async function reindexDocumentChunks(
  db: DatabaseClient,
  params: { documentId: number; content: string },
) {
  const plainText = documentContentToPlainText(params.content);
  const chunks = splitTextIntoChunks(plainText);

  await db`DELETE FROM document_chunks WHERE document_id = ${params.documentId}`;

  for (const chunk of chunks) {
    await db`
      INSERT INTO document_chunks (
        document_id,
        chunk_index,
        content,
        token_count,
        created_at,
        updated_at
      )
      VALUES (
        ${params.documentId},
        ${chunk.chunkIndex},
        ${chunk.content},
        ${chunk.tokenCount},
        NOW(),
        NOW()
      )
    `;
  }

  return {
    chunkCount: chunks.length,
    plainText,
  };
}

export async function retrieveRelevantDocumentChunks(
  params: { documentId: number; question: string; limit?: number },
) {
  const limit = params.limit ?? 4;

  const rows = (await pg`
    SELECT
      chunk_index,
      content,
      ts_rank_cd(
        to_tsvector('english', content),
        websearch_to_tsquery('english', ${params.question})
      ) AS full_text_rank,
      ts_rank_cd(
        to_tsvector('simple', content),
        websearch_to_tsquery('simple', ${params.question})
      ) AS lexical_rank
    FROM document_chunks
    WHERE document_id = ${params.documentId}
      AND (
        to_tsvector('english', content) @@ websearch_to_tsquery('english', ${params.question})
        OR to_tsvector('simple', content) @@ websearch_to_tsquery('simple', ${params.question})
      )
    ORDER BY ((ts_rank_cd(
        to_tsvector('english', content),
        websearch_to_tsquery('english', ${params.question})
      ) * 2) + ts_rank_cd(
        to_tsvector('simple', content),
        websearch_to_tsquery('simple', ${params.question})
      )) DESC,
      chunk_index ASC
    LIMIT ${limit}
  `) as Array<{
    chunk_index: number | string;
    content: string;
    full_text_rank: number | string | null;
    lexical_rank: number | string | null;
  }>;

  return rows.map((row) => ({
    chunkIndex: Number(row.chunk_index),
    content: String(row.content),
    fullTextRank: Number(row.full_text_rank ?? 0),
    lexicalRank: Number(row.lexical_rank ?? 0),
  })) as RetrievedDocumentChunk[];
}

export async function getLeadingDocumentChunks(
  params: { documentId: number; limit?: number },
) {
  const limit = params.limit ?? 3;

  const rows = (await pg`
    SELECT
      chunk_index,
      content
    FROM document_chunks
    WHERE document_id = ${params.documentId}
    ORDER BY chunk_index ASC
    LIMIT ${limit}
  `) as Array<{
    chunk_index: number | string;
    content: string;
  }>;

  return rows.map((row) => ({
    chunkIndex: Number(row.chunk_index),
    content: String(row.content),
    fullTextRank: 0,
    lexicalRank: 0,
  })) as RetrievedDocumentChunk[];
}
