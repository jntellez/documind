export type {
  ApiError,
  Document,
  DocumentChatCitation,
  DocumentChatMessage,
  DocumentChatRequest,
  DocumentChatResponse,
  GetDocumentChatMessagesResponse,
  ProcessedDocument,
} from "@documind/types";

export interface FilePickerResult {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}
