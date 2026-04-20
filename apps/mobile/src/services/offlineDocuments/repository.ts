import { documentQueries, syncQueueQueries } from "@/storage/database";
import type { Document, ProcessedDocument } from "@documind/types";
import * as SQLite from "expo-sqlite";
import type { LocalDocument, SyncQueueItem } from "types/storage";
import { fromDocument, toDocument } from "types/storage";

const db = SQLite.openDatabaseSync("documind.db");

export function getAllLocalDocuments() {
  return documentQueries.getAll();
}

export function getLocalDocumentById(id: number) {
  return documentQueries.getById(id);
}

export function getDocumentByLocalOrServerId(id: number) {
  const localDoc = documentQueries.getById(id);
  if (localDoc) {
    return localDoc;
  }

  return documentQueries.getAll().find((doc) => doc.server_id === id) || null;
}

export function isDeletedServerDocument(serverId: number) {
  return db.getFirstSync(
    "SELECT * FROM documents WHERE server_id = ? AND deleted = 1",
    [serverId],
  );
}

export function updateLocalDocumentFromServer(localId: number, document: Document) {
  documentQueries.update(localId, fromDocument(document));
}

export function insertLocalDocumentFromServer(document: Document) {
  return documentQueries.insert({
    ...fromDocument(document),
    synced: 1,
    deleted: 0,
  });
}

export function insertLocalProcessedDocument(document: ProcessedDocument) {
  const now = new Date().toISOString();

  return documentQueries.insert({
    server_id: null,
    title: document.title,
    content: document.content,
    word_count: document.word_count || 0,
    original_url: document.original_url || "",
    created_at: now,
    updated_at: now,
    synced: 0,
    deleted: 0,
    tags: document.tags ? JSON.stringify(document.tags) : "[]",
  });
}

export function updateLocalDocumentTags(localId: number, tags: string[]) {
  documentQueries.update(localId, { tags: JSON.stringify(tags) } as Partial<LocalDocument>);
}

export function softDeleteLocalDocument(localId: number) {
  documentQueries.softDelete(localId);
}

export function hardDeleteLocalDocument(localId: number) {
  db.runSync("DELETE FROM documents WHERE id = ?", [localId]);
}

export function queueSyncAction(
  documentId: number | null,
  action: SyncQueueItem["action"],
  data: unknown,
) {
  syncQueueQueries.enqueue(documentId, action, data);
}

export function getPendingSyncQueue() {
  return syncQueueQueries.getPending();
}

export function dequeueSyncAction(id: number) {
  syncQueueQueries.dequeue(id);
}

export function toOfflineDocument(localDocument: LocalDocument) {
  return toDocument(localDocument);
}
