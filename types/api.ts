export interface ProcessedDocument {
  title: string;
  content: string;
  original_url: string;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  original_url: string;
  word_count: number;
  created_at: Date;
  updated_at: Date;
  user_id: number;
}

export interface ApiError {
  error: string;
  details?: any;
}

export interface FilePickerResult {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}
