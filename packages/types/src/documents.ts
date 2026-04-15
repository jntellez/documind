export interface ProcessUrlRequest {
  url: string;
}

export interface ProcessedDocument {
  title: string;
  content: string;
  original_url: string;
  word_count?: number;
  tags?: string[];
}

export interface Document {
  id: number;
  title: string;
  content: string;
  original_url: string;
  word_count: number;
  created_at: string;
  updated_at: string;
  user_id?: number;
  tags?: string[];
}

export interface SaveDocumentRequest {
  title: string;
  content: string;
  original_url: string;
  tags?: string[];
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface SaveDocumentResponse {
  success: boolean;
  document: Document;
}

export interface GetDocumentsResponse {
  success: boolean;
  documents: Document[];
  count: number;
}

export interface GetDocumentResponse {
  success: boolean;
  document: Document;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
