import NetInfo from "@react-native-community/netinfo";
import { documentQueries, syncQueueQueries } from "@/storage/database";
import * as SQLite from "expo-sqlite";
import {
  getDocuments as apiGetDocuments,
  getDocumentById as apiGetDocumentById,
  saveDocument as apiSaveDocument,
  deleteDocument as apiDeleteDocument,
} from "./documentService";
import { Document, ProcessedDocument } from "types/api";
import { toDocument, fromDocument } from "types/storage";

const db = SQLite.openDatabaseSync("documind.db");

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
          // Solo actualizar si no está marcado como eliminado
          if (!existing.deleted) {
            documentQueries.update(existing.id, {
              ...doc,
              server_id: doc.id,
            });
          }
        } else {
          // Verificar que no exista un registro eliminado con este server_id
          const deleted = db.getFirstSync(
            "SELECT * FROM documents WHERE server_id = ? AND deleted = 1",
            [doc.id]
          );

          if (!deleted) {
            documentQueries.insert({
              ...fromDocument(doc),
              synced: 1,
              deleted: 0,
            });
          }
        }
      });

      // Retornar documentos convertidos a formato API (excluyendo eliminados)
      return {
        documents: documentQueries.getAll().map(toDocument),
      };
    } catch (error) {
      console.log("❌ API error, using cache:", error);
    }
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
  // Buscar por ID local primero
  let doc = documentQueries.getById(id);

  // Si no se encuentra, buscar por server_id
  if (!doc) {
    const allDocs = documentQueries.getAll();
    doc = allDocs.find((d) => d.server_id === id) || null;
  }

  if (!doc) {
    throw new Error("Document not found");
  }

  // Marcar como eliminado localmente
  documentQueries.softDelete(doc.id);

  if (await checkConnectivity()) {
    try {
      // Si tiene server_id, eliminar en el servidor
      if (doc.server_id) {
        await apiDeleteDocument(doc.server_id);
        // Si se eliminó exitosamente del servidor, eliminar completamente de la BD local
        db.runSync("DELETE FROM documents WHERE id = ?", [doc.id]);
      } else {
        // Si no tiene server_id, solo eliminar localmente
        db.runSync("DELETE FROM documents WHERE id = ?", [doc.id]);
      }
    } catch (error) {
      // Si falla, agregar a la cola de sincronización
      syncQueueQueries.enqueue(doc.id, "DELETE", {
        id: doc.id,
        server_id: doc.server_id,
      });
    }
  } else {
    // Sin conexión, agregar a la cola de sincronización
    syncQueueQueries.enqueue(doc.id, "DELETE", {
      id: doc.id,
      server_id: doc.server_id,
    });
  }
};

export const syncWithServer = async () => {
  if (!(await checkConnectivity())) return;

  console.log("🔄 Syncing...");
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
          if (data.server_id) {
            await apiDeleteDocument(data.server_id);
          }
          // Eliminar completamente de la BD local después de sincronizar
          if (item.document_id) {
            db.runSync("DELETE FROM documents WHERE id = ?", [
              item.document_id,
            ]);
          }
          break;
      }

      syncQueueQueries.dequeue(item.id);
      console.log(`✅ Synced: ${item.action}`);
    } catch (error) {
      console.error("Sync failed:", error);
    }
  }

  console.log("✅ Sync complete");
};
