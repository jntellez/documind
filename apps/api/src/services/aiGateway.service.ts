import { config } from "../config";

type AiGatewayMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AiGatewayRequest = {
  task: "chat";
  messages: AiGatewayMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
  metadata?: Record<string, unknown>;
};

type AiGatewaySuccessResponse = {
  requestId: string;
  data: {
    provider: string;
    model: string;
    text: string;
    fallbackUsed: boolean;
  };
};

type RetrievalQueryRewriteParams = {
  question: string;
  title?: string;
};

type RetrievalQueryRewriteResult = {
  query: string;
  rewritten: boolean;
};

type AiGatewayErrorResponse = {
  requestId?: string;
  error?: {
    type?: string;
    message?: string;
    details?: unknown;
  };
};

type AiGatewayEmbeddingRequest = {
  input: string | string[];
  metadata?: Record<string, unknown>;
};

type AiGatewayEmbeddingResponse = {
  requestId: string;
  data: {
    provider: string;
    model: string;
    embeddings: Array<{
      index: number;
      vector: number[];
    }>;
    fallbackUsed: boolean;
  };
};

export class AiGatewayError extends Error {
  status: number;
  type?: string;
  details?: unknown;
  requestId?: string;

  constructor({
    message,
    status,
    type,
    details,
    requestId,
  }: {
    message: string;
    status: number;
    type?: string;
    details?: unknown;
    requestId?: string;
  }) {
    super(message);
    this.name = "AiGatewayError";
    this.status = status;
    this.type = type;
    this.details = details;
    this.requestId = requestId;
  }
}

export async function requestAiGatewayResponse(request: AiGatewayRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.aiGatewayTimeoutMs);

  try {
    const response = await fetch(`${config.aiGatewayUrl}/v1/ai/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    const rawBody = await response.text();
    const payload = rawBody
      ? (JSON.parse(rawBody) as AiGatewaySuccessResponse | AiGatewayErrorResponse)
      : undefined;

    if (!response.ok) {
      const errorPayload = payload as AiGatewayErrorResponse | undefined;

      throw new AiGatewayError({
        message: errorPayload?.error?.message || "AI Gateway request failed",
        status: response.status,
        type: errorPayload?.error?.type,
        details: errorPayload?.error?.details,
        requestId: errorPayload?.requestId,
      });
    }

    return payload as AiGatewaySuccessResponse;
  } catch (error) {
    if (error instanceof AiGatewayError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AiGatewayError({
        message: "AI Gateway request timed out",
        status: 504,
        type: "TIMEOUT",
      });
    }

    throw new AiGatewayError({
      message: error instanceof Error ? error.message : "Failed to reach AI Gateway",
      status: 502,
      type: "UNAVAILABLE",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestAiGatewayEmbeddings(
  request: AiGatewayEmbeddingRequest,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.aiGatewayTimeoutMs);

  try {
    const response = await fetch(`${config.aiGatewayUrl}/v1/ai/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    const rawBody = await response.text();
    const payload = rawBody
      ? (JSON.parse(rawBody) as AiGatewayEmbeddingResponse | AiGatewayErrorResponse)
      : undefined;

    if (!response.ok) {
      const errorPayload = payload as AiGatewayErrorResponse | undefined;

      throw new AiGatewayError({
        message: errorPayload?.error?.message || "AI Gateway embedding request failed",
        status: response.status,
        type: errorPayload?.error?.type,
        details: errorPayload?.error?.details,
        requestId: errorPayload?.requestId,
      });
    }

    return payload as AiGatewayEmbeddingResponse;
  } catch (error) {
    if (error instanceof AiGatewayError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AiGatewayError({
        message: "AI Gateway embedding request timed out",
        status: 504,
        type: "TIMEOUT",
      });
    }

    throw new AiGatewayError({
      message: error instanceof Error ? error.message : "Failed to reach AI Gateway",
      status: 502,
      type: "UNAVAILABLE",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeRetrievalQuery(value: string) {
  return value
    .replace(/^query\s*:\s*/i, "")
    .replace(/^"|"$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function rewriteDocumentRetrievalQuery(
  params: RetrievalQueryRewriteParams,
): Promise<RetrievalQueryRewriteResult> {
  const fallbackQuery = params.question.trim();

  if (!fallbackQuery) {
    return { query: fallbackQuery, rewritten: false };
  }

  try {
    const response = await requestAiGatewayResponse({
      task: "chat",
      messages: [
        {
          role: "system",
          content: [
            "You rewrite document-chat questions into short lexical retrieval queries.",
            "Output only the rewritten query, with no explanation.",
            "Prefer English keywords when the user writes in another language.",
            "For broad summary or overview requests, rewrite into concise document-topic keywords that help retrieve introductory or high-signal passages.",
            "Keep the query under 12 words and preserve the user's intent.",
          ].join("\n"),
        },
        {
          role: "user",
          content: [
            params.title ? `Document title: ${params.title}` : undefined,
            `Question: ${fallbackQuery}`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
      temperature: 0,
      maxTokens: 40,
      responseFormat: "text",
      metadata: {
        source: "documind-document-chat-retrieval-rewrite",
      },
    });

    const rewrittenQuery = normalizeRetrievalQuery(response.data.text);

    if (!rewrittenQuery) {
      return { query: fallbackQuery, rewritten: false };
    }

    return {
      query: rewrittenQuery,
      rewritten: rewrittenQuery.toLowerCase() !== fallbackQuery.toLowerCase(),
    };
  } catch {
    return { query: fallbackQuery, rewritten: false };
  }
}
