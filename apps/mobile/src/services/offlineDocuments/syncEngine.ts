import {
  deleteDocument as apiDeleteDocument,
  saveDocument as apiSaveDocument,
  updateDocument as apiUpdateDocument,
} from "@/services/documentService";

import { checkConnectivity } from "./connectivity";
import {
  dequeueSyncAction,
  getLocalDocumentById,
  getPendingSyncQueue,
  hardDeleteLocalDocument,
  updateLocalDocumentFromServer,
} from "./repository";

let isSyncInProgress = false;

export async function syncWithServer() {
  if (isSyncInProgress) return;

  isSyncInProgress = true;

  try {
    if (!(await checkConnectivity())) return;

    console.log("🔄 Syncing...");
    const queue = getPendingSyncQueue();

    for (const item of queue) {
      try {
        const data = JSON.parse(item.data);

        switch (item.action) {
          case "CREATE": {
            const response = await apiSaveDocument(data);
            if (item.document_id) {
              updateLocalDocumentFromServer(item.document_id, response.document);
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
            } else if (data.id) {
              const updatedDocument = await apiUpdateDocument(data.id, data);

              if (item.document_id) {
                updateLocalDocumentFromServer(item.document_id, updatedDocument);
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
      } catch (error: any) {
        console.error("Sync failed:", error);

        const message = error.message?.toLowerCase() || "";
        if (
          message.includes("not found") ||
          message.includes("unauthorized") ||
          message.includes("failed to update") ||
          message.includes("invalid") ||
          message.includes("required")
        ) {
          dequeueSyncAction(item.id);
          console.log(`🗑️ Descartando tarea de sync irrecuperable: ${item.action}`);
        }
      }
    }

    console.log("✅ Sync complete");
  } finally {
    isSyncInProgress = false;
  }
}
