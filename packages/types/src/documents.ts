export interface DocumentListItem {
  text: string;
  marker?: string;
  children?: DocumentListItem[];
}

export type DocumentBlock =
  | {
      type: "heading";
      text: string;
      level?: 1 | 2 | 3 | 4 | 5 | 6;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      ordered?: boolean;
      items: Array<DocumentListItem | string>;
    }
  | {
      type: "divider";
    };

export interface ProcessUrlRequest {
  url: string;
}

export interface ProcessedDocument {
  title: string;
  content: string;
  renderedHtml: string;
  rawText: string;
  blocks?: DocumentBlock[];
  sourceType: "url" | "file";
  sourceName?: string;
  sourceMimeType?: string;
  originalUrl?: string;
  original_url: string;
  word_count?: number;
  tags?: string[];
}

export interface Document {
  id: number;
  title: string;
  content: string;
  renderedHtml: string;
  rawText: string;
  blocks?: DocumentBlock[];
  sourceType: string;
  sourceName?: string;
  sourceMimeType?: string;
  originalUrl?: string;
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
  renderedHtml?: string;
  rawText?: string;
  blocks?: DocumentBlock[];
  sourceType?: string;
  sourceName?: string;
  sourceMimeType?: string;
  originalUrl?: string;
  original_url: string;
  tags?: string[];
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  renderedHtml?: string;
  rawText?: string;
  blocks?: DocumentBlock[];
  sourceType?: string;
  sourceName?: string;
  sourceMimeType?: string;
  originalUrl?: string;
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
