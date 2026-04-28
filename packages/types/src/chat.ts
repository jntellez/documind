export interface DocumentChatRequest {
  message: string;
}

export interface DocumentChatCitation {
  chunkIndex: number;
  excerpt: string;
}

export interface DocumentChatMessage {
  id: number;
  document_id: number;
  user_id: number;
  role: "user" | "assistant";
  content: string;
  citations?: DocumentChatCitation[] | null;
  created_at: string;
}

export interface DocumentChatResponse {
  success: boolean;
  answer: string;
  citations?: DocumentChatCitation[];
  requestId?: string;
  provider?: string;
  model?: string;
  fallbackUsed?: boolean;
}

export interface GetDocumentChatMessagesResponse {
  success: boolean;
  messages: DocumentChatMessage[];
}
