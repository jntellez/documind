import {
  checkConnectivity,
  initializeOfflineDocumentConnectivity,
} from "./offlineDocuments/connectivity";
import { initializeRetryScheduler } from "./offlineDocuments/retryScheduler";
import { getNextRetryAt } from "./offlineDocuments/repository";
import { scheduleRetryAt } from "./offlineDocuments/retryScheduler";
import {
  deleteDocumentOffline,
  getDocumentByIdOffline,
  getDocumentsOffline,
  saveDocumentOffline,
  updateDocumentTagsOffline,
} from "./offlineDocuments/documentOperations";
import { syncWithServer } from "./offlineDocuments/syncEngine";

let hasInitializedOfflineDocumentService = false;

export function initializeOfflineDocumentService() {
  if (hasInitializedOfflineDocumentService) {
    return;
  }

  hasInitializedOfflineDocumentService = true;

  initializeOfflineDocumentConnectivity(syncWithServer);
  initializeRetryScheduler(() => {
    void syncWithServer();
  });
  scheduleRetryAt(getNextRetryAt());
}

export {
  checkConnectivity,
  deleteDocumentOffline,
  getDocumentByIdOffline,
  getDocumentsOffline,
  saveDocumentOffline,
  syncWithServer,
  updateDocumentTagsOffline,
};
