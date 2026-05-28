import { documentQueries, documentSyncQueries, syncQueueQueries } from "@/storage/database";
import type { Document, ProcessedDocument } from "@documind/types";
import * as SQLite from "expo-sqlite";
import type { LocalDocument, SyncQueueItem } from "types/storage";
import { fromDocument, toDocument } from "types/storage";

const db = SQLite.openDatabaseSync("documind.db");

export type OfflineDocument = Document & {
  syncStatus?: "synced" | "pending" | "error" | "conflict";
  syncError?: string | null;
};

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
    content: document.renderedHtml || document.content,
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

export function getSyncQueueStats() {
  return syncQueueQueries.getStats();
}

export function dequeueSyncAction(id: number) {
  syncQueueQueries.dequeue(id);
}

export function markSyncRetry(id: number, attempts: number, nextAttemptAt: string, error: string) {
  syncQueueQueries.updateRetry(id, attempts, nextAttemptAt, error);
}

export function markSyncFailed(id: number, error: string) {
  syncQueueQueries.markFailed(id, error);
}

export function getNextRetryAt() {
  return syncQueueQueries.getNextRetryAt();
}

export function hasQueuedCreate(documentId: number) {
  return syncQueueQueries.hasCreateForDocument(documentId);
}

export function replaceQueuedCreateData(documentId: number, data: unknown) {
  syncQueueQueries.replaceCreateData(documentId, data);
}

export function getQueuedCreateData<T>(documentId: number) {
  const raw = syncQueueQueries.getCreateData(documentId);

  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

export function setDocumentSyncStatus(
  documentId: number,
  status: "synced" | "pending" | "error" | "conflict",
  error?: string,
) {
  documentSyncQueries.setStatus(documentId, status, error);
}

export function toOfflineDocument(localDocument: LocalDocument) {
  return {
    ...toDocument(localDocument),
    syncStatus: localDocument.sync_status ?? "synced",
    syncError: localDocument.last_sync_error ?? null,
  } as OfflineDocument;
}
