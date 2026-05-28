import {
  deleteDocument as apiDeleteDocument,
  getDocumentById as apiGetDocumentById,
  getDocuments as apiGetDocuments,
  saveDocument as apiSaveDocument,
  updateDocument as apiUpdateDocument,
} from "@/services/documentService";
import type { Document, ProcessedDocument } from "@documind/types";

import { checkConnectivity } from "./connectivity";
import { shouldAttemptPreFetchSync, type GetDocumentsOfflineOptions } from "./syncGuards";
import { scheduleRetrySoon } from "./retryScheduler";
import { syncWithServer } from "./syncEngine";
import {
  getAllLocalDocuments,
  getDocumentByLocalOrServerId,
  getLocalDocumentById,
  getQueuedCreateData,
  hardDeleteLocalDocument,
  hasQueuedCreate,
  insertLocalDocumentFromServer,
  insertLocalProcessedDocument,
  isDeletedServerDocument,
  queueSyncAction,
  replaceQueuedCreateData,
  setDocumentSyncStatus,
  softDeleteLocalDocument,
  toOfflineDocument,
  updateLocalDocumentFromServer,
  updateLocalDocumentTags,
} from "./repository";
import { MAX_DOCUMENT_TAGS } from "@/hooks/documents/tagLimits";

type TagUpdateSyncResult = {
  syncStatus: "synced" | "pending";
  syncError: null;
};

function buildPendingTagUpdateResult(): TagUpdateSyncResult {
  return {
    syncStatus: "pending",
    syncError: null,
  };
}

function queueTagUpdate(documentId: number, serverId: number | null, tags: string[]) {
  queueSyncAction(documentId, "UPDATE", { id: serverId, tags });
}

function queueDelete(documentId: number, serverId: number | null) {
  queueSyncAction(documentId, "DELETE", {
    id: documentId,
    server_id: serverId,
  });
}

function buildSavedDocumentResult(localId: number) {
  const savedDoc = getLocalDocumentById(localId)!;
  return {
    success: true,
    document: toOfflineDocument(savedDoc),
  };
}

export async function getDocumentsOffline(options?: GetDocumentsOfflineOptions) {
  let localDocs = getAllLocalDocuments();

  if (await checkConnectivity()) {
    try {
      const hasLocalCreates = localDocs.some((document) => document.server_id === null);

      if (shouldAttemptPreFetchSync(hasLocalCreates, options)) {
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
  setDocumentSyncStatus(localId, "pending");

  if (await checkConnectivity()) {
    try {
      const response = await apiSaveDocument(document);

      updateLocalDocumentFromServer(localId, response.document);
      setDocumentSyncStatus(localId, "synced");
      return buildSavedDocumentResult(localId);
    } catch {
      queueSyncAction(localId, "CREATE", document);
      scheduleRetrySoon();
    }
  } else {
    queueSyncAction(localId, "CREATE", document);
  }

  return buildSavedDocumentResult(localId);
}

export async function updateDocumentTagsOffline(id: number, tags: string[]) {
  if (tags.length > MAX_DOCUMENT_TAGS) {
    throw new Error(`Maximum ${MAX_DOCUMENT_TAGS} tags allowed`);
  }

  const document = getDocumentByLocalOrServerId(id);

  if (!document) {
    throw new Error("Document not found");
  }

  updateLocalDocumentTags(document.id, tags);
  setDocumentSyncStatus(document.id, "pending");

  if (!document.server_id && hasQueuedCreate(document.id)) {
    const queuedCreateData = getQueuedCreateData<ProcessedDocument>(document.id);

    replaceQueuedCreateData(document.id, {
      ...(queuedCreateData ?? {}),
      tags,
    });
    return buildPendingTagUpdateResult();
  }

  if (await checkConnectivity()) {
    try {
      if (document.server_id) {
        await apiUpdateDocument(document.server_id, { tags });
        setDocumentSyncStatus(document.id, "synced");
        return {
          syncStatus: "synced" as const,
          syncError: null,
        };
      } else {
        queueTagUpdate(document.id, document.server_id, tags);
        return buildPendingTagUpdateResult();
      }
    } catch {
      queueTagUpdate(document.id, document.server_id, tags);
      scheduleRetrySoon();
      return buildPendingTagUpdateResult();
    }
  } else {
    queueTagUpdate(document.id, document.server_id, tags);
    return buildPendingTagUpdateResult();
  }
}

export async function deleteDocumentOffline(id: number) {
  const document = getDocumentByLocalOrServerId(id);

  if (!document) {
    throw new Error("Document not found");
  }

  softDeleteLocalDocument(document.id);
  setDocumentSyncStatus(document.id, "pending");

  if (await checkConnectivity()) {
    try {
      if (document.server_id) {
        await apiDeleteDocument(document.server_id);
      }

      hardDeleteLocalDocument(document.id);
    } catch {
      queueDelete(document.id, document.server_id);
      scheduleRetrySoon();
    }
  } else {
    queueDelete(document.id, document.server_id);
  }
}
