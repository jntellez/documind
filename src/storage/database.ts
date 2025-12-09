import * as SQLite from "expo-sqlite";
import { LocalDocument, SyncQueueItem } from "types/storage";

const db = SQLite.openDatabaseSync("documind.db");

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER UNIQUE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      word_count INTEGER DEFAULT 0,
      original_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER,
      action TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );

    CREATE INDEX IF NOT EXISTS idx_synced ON documents(synced);
    CREATE INDEX IF NOT EXISTS idx_deleted ON documents(deleted);
  `);
};

export const documentQueries = {
  getAll: (): LocalDocument[] => {
    return db.getAllSync(
      "SELECT * FROM documents WHERE deleted = 0 ORDER BY created_at DESC"
    ) as LocalDocument[];
  },

  getById: (id: number): LocalDocument | null => {
    return db.getFirstSync(
      "SELECT * FROM documents WHERE id = ? AND deleted = 0",
      [id]
    ) as LocalDocument | null;
  },

  insert: (doc: Omit<LocalDocument, "id">): number => {
    if (!doc.title || !doc.content) {
      throw new Error("Title and content are required");
    }

    const result = db.runSync(
      `INSERT INTO documents (
        server_id, title, content, word_count, 
        original_url, created_at, updated_at, synced, deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        doc.server_id,
        doc.title,
        doc.content,
        doc.word_count,
        doc.original_url,
        doc.created_at,
        doc.updated_at,
        doc.synced,
        doc.deleted,
      ]
    );
    return result.lastInsertRowId;
  },

  update: (id: number, doc: Partial<Omit<LocalDocument, "id">>) => {
    const fields: string[] = [];
    const values: any[] = [];

    if (doc.server_id !== undefined) {
      fields.push("server_id = ?");
      values.push(doc.server_id);
    }
    if (doc.title !== undefined) {
      fields.push("title = ?");
      values.push(doc.title);
    }
    if (doc.content !== undefined) {
      fields.push("content = ?");
      values.push(doc.content);
    }
    if (doc.word_count !== undefined) {
      fields.push("word_count = ?");
      values.push(doc.word_count);
    }
    if (doc.original_url !== undefined) {
      fields.push("original_url = ?");
      values.push(doc.original_url);
    }

    // Siempre actualizar updated_at y synced
    fields.push("updated_at = ?", "synced = ?");
    values.push(new Date().toISOString(), doc.server_id ? 1 : 0);

    values.push(id);

    db.runSync(
      `UPDATE documents SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
  },

  softDelete: (id: number) => {
    const now = new Date().toISOString();
    db.runSync(
      "UPDATE documents SET deleted = 1, synced = 0, updated_at = ? WHERE id = ?",
      [now, id]
    );
  },

  getUnsyncedDocuments: (): LocalDocument[] => {
    return db.getAllSync(
      "SELECT * FROM documents WHERE synced = 0 AND deleted = 0"
    ) as LocalDocument[];
  },
};

export const syncQueueQueries = {
  enqueue: (documentId: number | null, action: string, data: any) => {
    const now = new Date().toISOString();
    db.runSync(
      "INSERT INTO sync_queue (document_id, action, data, created_at) VALUES (?, ?, ?, ?)",
      [documentId, action, JSON.stringify(data), now]
    );
  },

  getPending: (): SyncQueueItem[] => {
    return db.getAllSync(
      "SELECT * FROM sync_queue ORDER BY created_at ASC"
    ) as SyncQueueItem[];
  },

  dequeue: (id: number) => {
    db.runSync("DELETE FROM sync_queue WHERE id = ?", [id]);
  },
};
