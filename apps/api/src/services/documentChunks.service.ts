import pg from "../db";
import {
  documentContentToPlainText,
  splitTextIntoChunks,
} from "../lib/document-text";
import { requestAiGatewayEmbeddings } from "./aiGateway.service";

type DatabaseClient = typeof pg;

export type RetrievedDocumentChunk = {
  chunkIndex: number;
  content: string;
  fullTextRank: number;
  lexicalRank: number;
  semanticDistance?: number;
};

function toVectorLiteral(values: number[]) {
  return `[${values.join(",")}]`;
}

async function buildChunkEmbeddings(chunks: Array<{ content: string }>) {
  if (chunks.length === 0) {
    return [] as Array<number[] | null>;
  }

  try {
    const response = await requestAiGatewayEmbeddings({
      input: chunks.map((chunk) => chunk.content),
      metadata: {
        source: "documind-document-chunks-reindex",
      },
    });

    const vectorsByIndex = new Map<number, number[]>();

    for (const embedding of response.data.embeddings) {
      if (Array.isArray(embedding.vector) && embedding.vector.length > 0) {
        vectorsByIndex.set(embedding.index, embedding.vector);
      }
    }

    return chunks.map((_, index) => vectorsByIndex.get(index) ?? null);
  } catch (error) {
    console.warn("Chunk embedding generation failed. Continuing with lexical fallback.", error);
    return chunks.map(() => null);
  }
}

export async function retrieveSemanticDocumentChunks(params: {
  documentId: number;
  queryEmbedding: number[];
  limit?: number;
}) {
  if (params.queryEmbedding.length === 0) {
    return [] as RetrievedDocumentChunk[];
  }

  const limit = params.limit ?? 4;
  const queryVector = toVectorLiteral(params.queryEmbedding);

  const rows = (await pg`
    SELECT
      chunk_index,
      content,
      (embedding <=> ${queryVector}::vector) AS semantic_distance
    FROM document_chunks
    WHERE document_id = ${params.documentId}
      AND embedding IS NOT NULL
    ORDER BY semantic_distance ASC, chunk_index ASC
    LIMIT ${limit}
  `) as Array<{
    chunk_index: number | string;
    content: string;
    semantic_distance: number | string | null;
  }>;

  return rows.map((row) => ({
    chunkIndex: Number(row.chunk_index),
    content: String(row.content),
    fullTextRank: 0,
    lexicalRank: 0,
    semanticDistance: Number(row.semantic_distance ?? 1),
  })) as RetrievedDocumentChunk[];
}

export async function reindexDocumentChunks(
  db: DatabaseClient,
  params: { documentId: number; content: string },
) {
  const plainText = documentContentToPlainText(params.content);
  const chunks = splitTextIntoChunks(plainText);
  const chunkEmbeddings = await buildChunkEmbeddings(chunks);

  await db`DELETE FROM document_chunks WHERE document_id = ${params.documentId}`;

  for (const [index, chunk] of chunks.entries()) {
    const embeddingVector = chunkEmbeddings[index]
      ? toVectorLiteral(chunkEmbeddings[index] as number[])
      : null;

    await db`
      INSERT INTO document_chunks (
        document_id,
        chunk_index,
        content,
        token_count,
        embedding,
        created_at,
        updated_at
      )
      VALUES (
        ${params.documentId},
        ${chunk.chunkIndex},
        ${chunk.content},
        ${chunk.tokenCount},
        ${embeddingVector}::vector,
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
