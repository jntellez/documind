import NetInfo from "@react-native-community/netinfo";
import { documentQueries, syncQueueQueries } from "@/storage/database";
import * as SQLite from "expo-sqlite";
import {
  getDocuments as apiGetDocuments,
  getDocumentById as apiGetDocumentById,
  saveDocument as apiSaveDocument,
  deleteDocument as apiDeleteDocument,
  updateDocument as apiUpdateDocument, // <-- IMPORTANTE
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
          if (!existing.deleted) {
            // Usamos fromDocument para que tags se guarde correctamente en SQLite
            documentQueries.update(existing.id, fromDocument(doc));
          }
        } else {
          const deleted = db.getFirstSync(
            "SELECT * FROM documents WHERE server_id = ? AND deleted = 1",
            [doc.id],
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

      return {
        documents: documentQueries.getAll().map(toDocument),
      };
    } catch (error) {
      console.log("❌ API error, using cache:", error);
    }
  }

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

  // Insertar localmente
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
    tags: document.tags ? JSON.stringify(document.tags) : "[]",
  });

  if (await checkConnectivity()) {
    try {
      const response = await apiSaveDocument(document);

      documentQueries.update(localId, fromDocument(response.document));

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

// --- NUEVA FUNCIÓN PARA ACTUALIZAR ETIQUETAS ---
export const updateDocumentTagsOffline = async (id: number, tags: string[]) => {
  let doc = documentQueries.getById(id);

  if (!doc) {
    const allDocs = documentQueries.getAll();
    doc = allDocs.find((d) => d.server_id === id) || null;
  }

  if (!doc) throw new Error("Document not found");

  // 1. SQLite SÍ necesita que sea un string JSON
  documentQueries.update(doc.id, { tags: JSON.stringify(tags) } as any);

  // 2. API necesita el ARRAY PURO (tags) para pasar la validación de Zod
  if (await checkConnectivity()) {
    try {
      if (doc.server_id) {
        await apiUpdateDocument(doc.server_id, { tags });
      } else {
        syncQueueQueries.enqueue(doc.id, "UPDATE", { id: doc.server_id, tags });
      }
    } catch (error) {
      syncQueueQueries.enqueue(doc.id, "UPDATE", { id: doc.server_id, tags });
    }
  } else {
    syncQueueQueries.enqueue(doc.id, "UPDATE", { id: doc.server_id, tags });
  }
};

export const deleteDocumentOffline = async (id: number) => {
  let doc = documentQueries.getById(id);

  if (!doc) {
    const allDocs = documentQueries.getAll();
    doc = allDocs.find((d) => d.server_id === id) || null;
  }

  if (!doc) {
    throw new Error("Document not found");
  }

  documentQueries.softDelete(doc.id);

  if (await checkConnectivity()) {
    try {
      if (doc.server_id) {
        await apiDeleteDocument(doc.server_id);
      }
      db.runSync("DELETE FROM documents WHERE id = ?", [doc.id]);
    } catch (error) {
      syncQueueQueries.enqueue(doc.id, "DELETE", {
        id: doc.id,
        server_id: doc.server_id,
      });
    }
  } else {
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
            documentQueries.update(
              item.document_id,
              fromDocument(response.document),
            );
          }
          break;

        // --- CASO UPDATE AÑADIDO PARA LA COLA ---
        case "UPDATE":
          const localDoc = item.document_id
            ? documentQueries.getById(item.document_id)
            : null;

          if (localDoc && localDoc.server_id) {
            await apiUpdateDocument(localDoc.server_id, data);
          } else if (data.id) {
            await apiUpdateDocument(data.id, data);
          }
          break;

        case "DELETE":
          if (data.server_id) {
            try {
              await apiDeleteDocument(data.server_id);
            } catch (e: any) {
              const msg = e.message?.toLowerCase() || "";
              if (!msg.includes("not found")) throw e;
            }
          }
          if (item.document_id) {
            db.runSync("DELETE FROM documents WHERE id = ?", [
              item.document_id,
            ]);
          }
          break;
      }

      syncQueueQueries.dequeue(item.id);
      console.log(`✅ Synced: ${item.action}`);
    } catch (error: any) {
      console.error("Sync failed:", error);

      // Limpiar tareas fallidas permanentemente (400, 404, validaciones)
      const msg = error.message?.toLowerCase() || "";
      if (
        msg.includes("not found") ||
        msg.includes("unauthorized") ||
        msg.includes("failed to update") ||
        msg.includes("invalid") ||
        msg.includes("required")
      ) {
        syncQueueQueries.dequeue(item.id);
        console.log(
          `🗑️ Descartando tarea de sync irrecuperable: ${item.action}`,
        );
      }
    }
  }

  console.log("✅ Sync complete");
};
