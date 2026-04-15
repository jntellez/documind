export type { ApiError, Document, ProcessedDocument } from "@documind/types";

export interface FilePickerResult {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}
