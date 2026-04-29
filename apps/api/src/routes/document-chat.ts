import type {
  DocumentChatCitation,
  DocumentChatMessage,
  DocumentChatRequest,
  DocumentChatResponse,
  GetDocumentChatMessagesResponse,
} from "@documind/types";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { ZodError, z } from "zod";
import { config } from "../config";
import pg from "../db";
import {
  AiGatewayError,
  requestAiGatewayEmbeddings,
  requestAiGatewayResponse,
  rewriteDocumentRetrievalQuery,
} from "../services/aiGateway.service";
import {
  getLeadingDocumentChunks,
  retrieveSemanticDocumentChunks,
  retrieveRelevantDocumentChunks,
  type RetrievedDocumentChunk,
} from "../services/documentChunks.service";

const documentChatRoutes = new Hono();
const authJwt = jwt({ secret: config.jwtSecret, alg: "HS256" });

type JwtPayload = {
  sub?: string | number;
  id?: string | number;
};

const DocumentChatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(2000),
}) satisfies z.ZodType<DocumentChatRequest>;

type OwnedDocument = {
  id: number;
  title: string;
};

type DocumentChatMessageRow = {
  id: number | string;
  document_id: number | string;
  user_id: number | string;
  role: "user" | "assistant";
  content: string;
  citations?: unknown;
  created_at: string | Date;
};

function buildChunkExcerpt(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 180);
}

function buildDocumentChatCitations(
  chunks: Array<{ chunkIndex: number; content: string }>,
): DocumentChatCitation[] {
  return chunks.map((chunk) => ({
    chunkIndex: chunk.chunkIndex + 1,
    excerpt: buildChunkExcerpt(chunk.content),
  }));
}

function parseDocumentChatCitations(value: unknown): DocumentChatCitation[] | null {
  const parsedValue = typeof value === "string"
    ? (() => {
        try {
          return JSON.parse(value) as unknown;
        } catch {
          return null;
        }
      })()
    : value;

  if (!Array.isArray(parsedValue)) {
    return null;
  }

  const citations: DocumentChatCitation[] = [];

  for (const entry of parsedValue) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const citation = entry as Record<string, unknown>;

    const normalizedChunkIndex = Number(citation.chunkIndex);

    if (
      !Number.isFinite(normalizedChunkIndex) ||
      typeof citation.excerpt !== "string"
    ) {
      continue;
    }

    citations.push({
      chunkIndex: normalizedChunkIndex,
      excerpt: citation.excerpt,
    });
  }

  return citations.length > 0 ? citations : null;
}

function getUserId(payload: JwtPayload) {
  return Number(payload.sub || payload.id);
}

async function getOwnedDocument(documentId: number, userId: number) {
  const documents = await pg`
    SELECT id, title
    FROM documents
    WHERE id = ${documentId} AND user_id = ${userId}
  `;

  if (documents.length === 0) {
    return null;
  }

  const document = documents[0] as { id: number | string; title: string };

  return {
    id: Number(document.id),
    title: document.title,
  } satisfies OwnedDocument;
}

async function getQuestionEmbedding(question: string) {
  try {
    const response = await requestAiGatewayEmbeddings({
      input: question,
      metadata: {
        source: "documind-document-chat-query-embedding",
      },
    });

    const vector = response.data.embeddings.find((entry) => entry.index === 0)?.vector;
    return Array.isArray(vector) && vector.length > 0 ? vector : null;
  } catch {
    return null;
  }
}

function serializeDocumentChatMessage(
  message: DocumentChatMessageRow,
): DocumentChatMessage {
  return {
    id: Number(message.id),
    document_id: Number(message.document_id),
    user_id: Number(message.user_id),
    role: message.role,
    content: message.content,
    citations: parseDocumentChatCitations(message.citations),
    created_at: new Date(message.created_at).toISOString(),
  };
}

async function storeDocumentChatTurn({
  documentId,
  userId,
  userMessage,
  assistantMessage,
  assistantCitations,
}: {
  documentId: number;
  userId: number;
  userMessage: string;
  assistantMessage: string;
  assistantCitations?: DocumentChatCitation[];
}) {
  await pg.begin(async (tx) => {
    await tx`
      INSERT INTO document_chat_messages (document_id, user_id, role, content)
      VALUES (${documentId}, ${userId}, 'user', ${userMessage})
    `;

    await tx`
      INSERT INTO document_chat_messages (document_id, user_id, role, content, citations)
      VALUES (${documentId}, ${userId}, 'assistant', ${assistantMessage}, ${JSON.stringify(assistantCitations ?? [])}::jsonb)
    `;
  });
}

function buildGroundingPrompt(
  title: string,
  chunks: Array<{ chunkIndex: number; content: string }>,
) {
  return [
    "You are Documind's document assistant.",
    "Answer using only the document excerpts provided below.",
    "Do not use outside knowledge or guess.",
    "If the answer is not clearly supported by the document, reply exactly: 'I can't answer that from this document.'",
    "Answer in the same language as the user's question whenever possible.",
    "If the document supports the answer but is written in a different language, translate or summarize it in the user's language.",
    "Keep the answer concise and directly useful.",
    "--- DOCUMENT TITLE ---",
    title,
    "--- RETRIEVED DOCUMENT EXCERPTS ---",
    ...chunks.map(
      (chunk) => `Chunk ${chunk.chunkIndex + 1}:\n${chunk.content}`,
    ),
  ].join("\n");
}

function normalizeGatewayStatus(status: number) {
  switch (status) {
    case 400:
    case 401:
    case 403:
    case 404:
    case 408:
    case 409:
    case 422:
    case 429:
    case 500:
    case 502:
    case 503:
    case 504:
      return status;
    default:
      return 502;
  }
}

function isBroadDocumentQuestion(message: string) {
  return /(summari[sz]e|summary|overview|main points|what is this (document )?about|resumen|resume|resum[eí]|resumir|sintetiza|sintesis|síntesis|de qué trata|tema principal|puntos clave)/i.test(
    message,
  );
}

function isWeakChunkRetrieval(chunks: RetrievedDocumentChunk[]) {
  if (chunks.length === 0) {
    return true;
  }

  const semanticChunks = chunks.filter(
    (chunk) => typeof chunk.semanticDistance === "number",
  );

  if (semanticChunks.length > 0) {
    const bestDistance = Math.min(
      ...semanticChunks.map((chunk) => chunk.semanticDistance as number),
    );

    return bestDistance > 0.6;
  }

  const strongestRank = Math.max(
    ...chunks.map((chunk) => chunk.fullTextRank * 2 + chunk.lexicalRank),
  );

  return strongestRank < 0.2;
}

function mergeChunks(
  primary: RetrievedDocumentChunk[],
  fallback: RetrievedDocumentChunk[],
) {
  const merged = new Map<number, RetrievedDocumentChunk>();

  for (const chunk of [...primary, ...fallback]) {
    if (!merged.has(chunk.chunkIndex)) {
      merged.set(chunk.chunkIndex, chunk);
    }
  }

  return [...merged.values()];
}

documentChatRoutes.post("/documents/:id/chat", authJwt, async (c) => {
  try {
    const payload = c.get("jwtPayload") as JwtPayload;
    const userId = getUserId(payload);

    if (!userId) {
      return c.json({ error: "Invalid user ID in token" }, 401);
    }

    const documentId = Number(c.req.param("id"));

    if (!documentId || Number.isNaN(documentId)) {
      return c.json({ error: "Invalid document ID" }, 400);
    }

    const body = await c.req.json();
    const { message } = DocumentChatRequestSchema.parse(body);

    const document = await getOwnedDocument(documentId, userId);

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    const retrievalQuery = await rewriteDocumentRetrievalQuery({
      title: document.title,
      question: message,
    });

    const queryEmbedding = await getQuestionEmbedding(retrievalQuery.query);

    const semanticChunks = queryEmbedding
      ? await retrieveSemanticDocumentChunks({
          documentId,
          queryEmbedding,
          limit: 4,
        })
      : [];

    const lexicalChunks = await retrieveRelevantDocumentChunks({
      documentId,
      question: retrievalQuery.query,
      limit: 4,
    });

    const primaryChunks = semanticChunks.length > 0
      ? mergeChunks(semanticChunks, lexicalChunks)
      : lexicalChunks;

    const needsLeadingFallback =
      isWeakChunkRetrieval(primaryChunks) ||
      (isBroadDocumentQuestion(message) && primaryChunks.length < 4);

    const fallbackChunks = needsLeadingFallback
      ? await getLeadingDocumentChunks({
          documentId,
          limit: primaryChunks.length === 0 ? 4 : 2,
        })
      : [];

    const relevantChunks = mergeChunks(primaryChunks, fallbackChunks);

    if (relevantChunks.length === 0) {
      const answer = "I can't answer that from this document.";
      const citations: DocumentChatCitation[] = [];

      await storeDocumentChatTurn({
        documentId,
        userId,
        userMessage: message,
        assistantMessage: answer,
        assistantCitations: citations,
      });

      const response: DocumentChatResponse = {
        success: true,
        answer,
        citations,
      };

      return c.json(response);
    }

    const gatewayResponse = await requestAiGatewayResponse({
      task: "chat",
      messages: [
        {
          role: "system",
          content: buildGroundingPrompt(document.title, relevantChunks),
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.1,
      maxTokens: 300,
      responseFormat: "text",
      metadata: {
        source: "documind-document-chat",
        documentId,
        userId,
        retrievalQuery: retrievalQuery.query,
        retrievalQueryRewritten: retrievalQuery.rewritten,
        retrievedChunkCount: relevantChunks.length,
        semanticChunkCount: semanticChunks.length,
        lexicalChunkCount: lexicalChunks.length,
        leadingFallbackChunkCount: fallbackChunks.length,
      },
    });

    const citations = buildDocumentChatCitations(relevantChunks);

    const response: DocumentChatResponse = {
      success: true,
      answer: gatewayResponse.data.text.trim(),
      citations,
      requestId: gatewayResponse.requestId,
      provider: gatewayResponse.data.provider,
      model: gatewayResponse.data.model,
      fallbackUsed: gatewayResponse.data.fallbackUsed,
    };

    await storeDocumentChatTurn({
      documentId,
      userId,
      userMessage: message,
      assistantMessage: response.answer,
      assistantCitations: citations,
    });

    return c.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          error: "Invalid chat request",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        400,
      );
    }

    if (error instanceof AiGatewayError) {
      c.status(normalizeGatewayStatus(error.status));
      return c.json(
        {
          error: error.message,
          type: error.type,
          requestId: error.requestId,
          details: error.details,
        },
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error chatting with document:", error);
    return c.json({ error: errorMessage }, 500);
  }
});

documentChatRoutes.get("/documents/:id/chat/messages", authJwt, async (c) => {
  try {
    const payload = c.get("jwtPayload") as JwtPayload;
    const userId = getUserId(payload);

    if (!userId) {
      return c.json({ error: "Invalid user ID in token" }, 401);
    }

    const documentId = Number(c.req.param("id"));

    if (!documentId || Number.isNaN(documentId)) {
      return c.json({ error: "Invalid document ID" }, 400);
    }

    const document = await getOwnedDocument(documentId, userId);

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    const messages = await pg`
      SELECT id, document_id, user_id, role, content, citations, created_at
      FROM document_chat_messages
      WHERE document_id = ${documentId} AND user_id = ${userId}
      ORDER BY created_at ASC, id ASC
    `;

    const response: GetDocumentChatMessagesResponse = {
      success: true,
      messages: (messages as DocumentChatMessageRow[]).map(
        serializeDocumentChatMessage,
      ),
    };

    return c.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching document chat messages:", error);
    return c.json({ error: errorMessage }, 500);
  }
});

export default documentChatRoutes;
