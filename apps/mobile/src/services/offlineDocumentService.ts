import {
  checkConnectivity,
  initializeOfflineDocumentConnectivity,
} from "./offlineDocuments/connectivity";
import {
  deleteDocumentOffline,
  getDocumentByIdOffline,
  getDocumentsOffline,
  saveDocumentOffline,
  updateDocumentTagsOffline,
} from "./offlineDocuments/documentOperations";
import { syncWithServer } from "./offlineDocuments/syncEngine";

initializeOfflineDocumentConnectivity(syncWithServer);

export {
  checkConnectivity,
  deleteDocumentOffline,
  getDocumentByIdOffline,
  getDocumentsOffline,
  saveDocumentOffline,
  syncWithServer,
  updateDocumentTagsOffline,
};
