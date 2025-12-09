import NetInfo from "@react-native-community/netinfo";
import { documentQueries, syncQueueQueries } from "@/storage/database";
import {
  getDocuments as apiGetDocuments,
  getDocumentById as apiGetDocumentById,
  saveDocument as apiSaveDocument,
  deleteDocument as apiDeleteDocument,
} from "./documentService";
import { Document, ProcessedDocument } from "types/api";
import { toDocument, fromDocument } from "types/storage";

let isOnline = true;

NetInfo.addEventListener((state) => {
  const wasOffline = !isOnline;
  isOnline = state.isConnected ?? false;

  if (wasOffline && isOnline) {
    syncWithServer();
  }
});

export const checkConnectivity = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

export const getDocumentsOffline = async () => {
  const localDocs = documentQueries.getAll();

  if (await checkConnectivity()) {
    try {
      const response = await apiGetDocuments();

      response.documents.forEach((doc) => {
        const existing = localDocs.find((d) => d.server_id === doc.id);
        if (existing) {
          documentQueries.update(existing.id, {
            ...doc,
            server_id: doc.id,
          });
        } else {
          documentQueries.insert({
            ...fromDocument(doc),
            synced: 1,
            deleted: 0,
          });
        }
      });

      // Retornar documentos convertidos a formato API
      return {
        documents: documentQueries.getAll().map(toDocument),
      };
    } catch (error) {}
  }

  // Retornar documentos locales convertidos a formato API
  return {
    documents: localDocs.map(toDocument),
  };
};

export const getDocumentByIdOffline = async (id: number): Promise<Document> => {
  const localDoc = documentQueries.getById(id);

  if (localDoc) {
    return toDocument(localDoc);
  }

  if (await checkConnectivity()) {
    try {
      const doc = await apiGetDocumentById(id);
      documentQueries.insert({
        ...fromDocument(doc),
        synced: 1,
        deleted: 0,
      });
      return doc;
    } catch (error) {
      throw new Error("Document not found");
    }
  }

  throw new Error("Document not available offline");
};

export const saveDocumentOffline = async (document: ProcessedDocument) => {
  const now = new Date().toISOString();

  const localId = documentQueries.insert({
    server_id: null,
    title: document.title,
    content: document.content,
    word_count: document.word_count || 0,
    original_url: document.original_url || "",
    created_at: now,
    updated_at: now,
    synced: 0,
    deleted: 0,
  });

  if (await checkConnectivity()) {
    try {
      const response = await apiSaveDocument(document);

      documentQueries.update(localId, {
        ...response.document,
        server_id: response.document.id,
      });

      const savedDoc = documentQueries.getById(localId)!;
      return {
        success: true,
        document: toDocument(savedDoc),
      };
    } catch (error) {
      syncQueueQueries.enqueue(localId, "CREATE", document);
    }
  } else {
    syncQueueQueries.enqueue(localId, "CREATE", document);
  }

  const savedDoc = documentQueries.getById(localId)!;
  return {
    success: true,
    document: toDocument(savedDoc),
  };
};

export const deleteDocumentOffline = async (id: number) => {
  documentQueries.softDelete(id);

  if (await checkConnectivity()) {
    try {
      const doc = documentQueries.getById(id);
      if (doc?.server_id) {
        await apiDeleteDocument(doc.server_id);
      }
    } catch (error) {
      syncQueueQueries.enqueue(id, "DELETE", { id });
    }
  } else {
    syncQueueQueries.enqueue(id, "DELETE", { id });
  }
};

export const syncWithServer = async () => {
  if (!(await checkConnectivity())) return;

  const queue = syncQueueQueries.getPending();

  for (const item of queue) {
    try {
      const data = JSON.parse(item.data);

      switch (item.action) {
        case "CREATE":
          const response = await apiSaveDocument(data);
          if (item.document_id) {
            documentQueries.update(item.document_id, {
              ...response.document,
              server_id: response.document.id,
            });
          }
          break;

        case "DELETE":
          if (item.document_id) {
            const doc = documentQueries.getById(item.document_id);
            if (doc?.server_id) {
              await apiDeleteDocument(doc.server_id);
            }
          }
          break;
      }

      syncQueueQueries.dequeue(item.id);
    } catch (error) {
      console.error("Sync failed:", error);
    }
  }
};
