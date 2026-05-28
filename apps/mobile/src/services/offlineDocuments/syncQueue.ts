const MAX_RETRY_ATTEMPTS = 5;

export function enqueueSyncAction(documentId: number | null, action: "CREATE" | "UPDATE" | "DELETE", data: unknown) {
  const { syncQueueQueries } = require("@/storage/database") as typeof import("@/storage/database");
  syncQueueQueries.enqueue(documentId, action, data);
}

export function nextBackoffDate(attempts: number) {
  const seconds = Math.min(2 ** attempts * 5, 300);
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export function shouldFailPermanently(attempts: number) {
  return attempts >= MAX_RETRY_ATTEMPTS;
}
