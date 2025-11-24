export interface ProcessedDocument {
  title: string;
  content: string;
  originalUrl: string;
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