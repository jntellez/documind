import {
  deleteDocument as apiDeleteDocument,
  getDocumentById as apiGetDocumentById,
  getDocuments as apiGetDocuments,
  saveDocument as apiSaveDocument,
  updateDocument as apiUpdateDocument,
} from "@/services/documentService";
import type { Document, ProcessedDocument } from "@documind/types";

import { checkConnectivity } from "./connectivity";
import { syncWithServer } from "./syncEngine";
import {
  getAllLocalDocuments,
  getDocumentByLocalOrServerId,
  getLocalDocumentById,
  hardDeleteLocalDocument,
  insertLocalDocumentFromServer,
  insertLocalProcessedDocument,
  isDeletedServerDocument,
  queueSyncAction,
  softDeleteLocalDocument,
  toOfflineDocument,
  updateLocalDocumentFromServer,
  updateLocalDocumentTags,
} from "./repository";

export async function getDocumentsOffline() {
  let localDocs = getAllLocalDocuments();

  if (await checkConnectivity()) {
    try {
      if (localDocs.some((document) => document.server_id === null)) {
        await syncWithServer();
        localDocs = getAllLocalDocuments();
      }

      const response = await apiGetDocuments();

      response.documents.forEach((document) => {
        const existing = localDocs.find(
          (localDoc) => Number(localDoc.server_id) === Number(document.id),
        );

        if (existing) {
          if (!existing.deleted) {
            updateLocalDocumentFromServer(existing.id, document);
          }
          return;
        }

        if (!isDeletedServerDocument(document.id)) {
          insertLocalDocumentFromServer(document);
        }
      });

      return {
        documents: getAllLocalDocuments().map(toOfflineDocument),
      };
    } catch (error) {
      console.log("❌ API error, using cache:", error);
    }
  }

  return {
    documents: localDocs.map(toOfflineDocument),
  };
}

export async function getDocumentByIdOffline(id: number): Promise<Document> {
  const localDoc = getLocalDocumentById(id);

  if (localDoc) {
    return toOfflineDocument(localDoc);
  }

  if (await checkConnectivity()) {
    try {
      const document = await apiGetDocumentById(id);
      insertLocalDocumentFromServer(document);
      return document;
    } catch {
      throw new Error("Document not found");
    }
  }

  throw new Error("Document not available offline");
}

export async function saveDocumentOffline(document: ProcessedDocument) {
  const localId = insertLocalProcessedDocument(document);

  if (await checkConnectivity()) {
    try {
      const response = await apiSaveDocument(document);

      updateLocalDocumentFromServer(localId, response.document);

      const savedDoc = getLocalDocumentById(localId)!;
      return {
        success: true,
        document: toOfflineDocument(savedDoc),
      };
    } catch {
      queueSyncAction(localId, "CREATE", document);
    }
  } else {
    queueSyncAction(localId, "CREATE", document);
  }

  const savedDoc = getLocalDocumentById(localId)!;
  return {
    success: true,
    document: toOfflineDocument(savedDoc),
  };
}

export async function updateDocumentTagsOffline(id: number, tags: string[]) {
  const document = getDocumentByLocalOrServerId(id);

  if (!document) {
    throw new Error("Document not found");
  }

  updateLocalDocumentTags(document.id, tags);

  if (await checkConnectivity()) {
    try {
      if (document.server_id) {
        await apiUpdateDocument(document.server_id, { tags });
      } else {
        queueSyncAction(document.id, "UPDATE", { id: document.server_id, tags });
      }
    } catch {
      queueSyncAction(document.id, "UPDATE", { id: document.server_id, tags });
    }
  } else {
    queueSyncAction(document.id, "UPDATE", { id: document.server_id, tags });
  }
}

export async function deleteDocumentOffline(id: number) {
  const document = getDocumentByLocalOrServerId(id);

  if (!document) {
    throw new Error("Document not found");
  }

  softDeleteLocalDocument(document.id);

  if (await checkConnectivity()) {
    try {
      if (document.server_id) {
        await apiDeleteDocument(document.server_id);
      }

      hardDeleteLocalDocument(document.id);
    } catch {
      queueSyncAction(document.id, "DELETE", {
        id: document.id,
        server_id: document.server_id,
      });
    }
  } else {
    queueSyncAction(document.id, "DELETE", {
      id: document.id,
      server_id: document.server_id,
    });
  }
}
