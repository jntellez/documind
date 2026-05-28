import {
  deleteDocument as apiDeleteDocument,
  saveDocument as apiSaveDocument,
  updateDocument as apiUpdateDocument,
} from "@/services/documentService";

import { checkConnectivity } from "./connectivity";
import { classifySyncError, isRetryableError } from "./errorClassifier";
import { nextBackoffDate, shouldFailPermanently } from "./syncQueue";
import { updateSyncState } from "./syncState";
import { summarizeSyncError } from "./syncErrorSummary";
import {
  dequeueSyncAction,
  getLocalDocumentById,
  getNextRetryAt,
  getSyncQueueStats,
  markSyncFailed,
  markSyncRetry,
  getPendingSyncQueue,
  hardDeleteLocalDocument,
  setDocumentSyncStatus,
  updateLocalDocumentFromServer,
} from "./repository";
import { scheduleRetryAt } from "./retryScheduler";
import { showToast } from "@/components/ui/Toast";

let isSyncInProgress = false;

function refreshSyncCounts() {
  const stats = getSyncQueueStats();
  updateSyncState({
    pendingCount: stats.activeCount,
    readyCount: stats.readyCount,
    failedCount: stats.failedCount,
  });
}

function scheduleNextRetryIfNeeded() {
  scheduleRetryAt(getNextRetryAt());
}

export async function syncWithServer() {
  if (isSyncInProgress) return;

  isSyncInProgress = true;
  updateSyncState({ isSyncing: true, lastError: undefined });
  refreshSyncCounts();

  try {
    let transientToastShown = false;

    if (!(await checkConnectivity())) {
      updateSyncState({ isOnline: false, isSyncing: false });
      scheduleNextRetryIfNeeded();
      return;
    }

    updateSyncState({ isOnline: true });

    console.log("🔄 Syncing...");
    const queue = getPendingSyncQueue();
    refreshSyncCounts();

    for (const item of queue) {
      try {
        const data = JSON.parse(item.data);

        switch (item.action) {
          case "CREATE": {
            const response = await apiSaveDocument(data);
            if (item.document_id) {
              updateLocalDocumentFromServer(item.document_id, response.document);
              setDocumentSyncStatus(item.document_id, "synced");
            }
            break;
          }

          case "UPDATE": {
            const localDoc = item.document_id
              ? getLocalDocumentById(item.document_id)
              : null;

            if (localDoc && localDoc.server_id) {
              const updatedDocument = await apiUpdateDocument(localDoc.server_id, data);
              updateLocalDocumentFromServer(localDoc.id, updatedDocument);
              setDocumentSyncStatus(localDoc.id, "synced");
            } else if (localDoc && !localDoc.server_id) {
              throw new Error("Waiting for document creation to sync before applying updates");
            } else if (data.id) {
              const updatedDocument = await apiUpdateDocument(data.id, data);

              if (item.document_id) {
                updateLocalDocumentFromServer(item.document_id, updatedDocument);
                setDocumentSyncStatus(item.document_id, "synced");
              }
            }
            break;
          }

          case "DELETE": {
            if (data.server_id) {
              try {
                await apiDeleteDocument(data.server_id);
              } catch (error: any) {
                const message = error.message?.toLowerCase() || "";
                if (!message.includes("not found")) {
                  throw error;
                }
              }
            }

            if (item.document_id) {
              hardDeleteLocalDocument(item.document_id);
            }
            break;
          }
        }

        dequeueSyncAction(item.id);
        console.log(`✅ Synced: ${item.action}`);
        scheduleNextRetryIfNeeded();
      } catch (error: any) {
        const errorType = classifySyncError(error);
        const errorMessage = summarizeSyncError(error);
        const attempts = (item.attempts ?? 0) + 1;

        if (!isRetryableError(errorType) || shouldFailPermanently(attempts)) {
          console.error("Sync failed permanently:", error);
          updateSyncState({ lastError: errorMessage });

          if (item.document_id) {
            setDocumentSyncStatus(
              item.document_id,
              errorType === "conflict" ? "conflict" : "error",
              errorMessage,
            );
          }

          markSyncFailed(item.id, errorMessage);
          refreshSyncCounts();
          scheduleNextRetryIfNeeded();
          continue;
        }

        markSyncRetry(item.id, attempts, nextBackoffDate(attempts), errorMessage);
        if (!transientToastShown) {
          transientToastShown = true;
          showToast({
            type: "error",
            text1: "Sync delayed",
            text2: "Document changes were saved locally and will retry automatically.",
          });
        }
        refreshSyncCounts();
        scheduleNextRetryIfNeeded();
      }
    }

    refreshSyncCounts();
    scheduleNextRetryIfNeeded();
    console.log("✅ Sync complete");
  } finally {
    isSyncInProgress = false;
    updateSyncState({
      isSyncing: false,
      syncCycle: Date.now(),
    });
  }
}
