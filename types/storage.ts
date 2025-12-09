import { Document } from "./api";

export interface LocalDocument {
  id: number; // ID local (autoincrement)
  server_id: number | null; // ID del servidor
  title: string;
  content: string;
  original_url: string;
  word_count: number;
  created_at: string;
  updated_at: string;
  synced: number; // 0 o 1 (boolean en SQLite)
  deleted: number; // 0 o 1 (boolean en SQLite)
}

export interface SyncQueueItem {
  id: number;
  document_id: number | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  data: string; // JSON stringified
  created_at: string;
}

// Utilidad para convertir LocalDocument a Document
export function toDocument(local: LocalDocument): Document {
  return {
    id: local.server_id || local.id,
    title: local.title,
    content: local.content,
    original_url: local.original_url,
    word_count: local.word_count,
    created_at: local.created_at,
    updated_at: local.updated_at,
  };
}

// Utilidad para preparar Document para insert local
export function fromDocument(
  doc: Document
): Omit<LocalDocument, "id" | "synced" | "deleted"> {
  return {
    server_id: doc.id,
    title: doc.title,
    content: doc.content,
    original_url: doc.original_url,
    word_count: doc.word_count,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}
