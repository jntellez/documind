export interface ProcessedDocument {
  title: string;
  content: string;
  originalUrl: string;
}

export interface ApiError {
  error: string;
  details?: any;
}
