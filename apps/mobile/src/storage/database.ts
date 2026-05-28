import * as SQLite from "expo-sqlite";
import { LocalDocument, SyncQueueItem } from "types/storage";

const db = SQLite.openDatabaseSync("documind.db");

export const clearAllLocalData = () => {
  db.runSync("DELETE FROM sync_queue");
  clearLocalDocuments();
};

export const clearLocalDocuments = () => {
  db.runSync("DELETE FROM documents");
};

export const hasPendingSyncActions = () => {
  const result = db.getFirstSync(
    "SELECT COUNT(*) as pending_count FROM sync_queue WHERE status IN ('pending','retry')",
  ) as { pending_count: number } | null;

  return (result?.pending_count ?? 0) > 0;
};

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
      deleted INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      sync_status TEXT DEFAULT 'synced',
      last_sync_error TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER,
      action TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      next_attempt_at TEXT,
      last_error TEXT,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );

    CREATE INDEX IF NOT EXISTS idx_synced ON documents(synced);
    CREATE INDEX IF NOT EXISTS idx_deleted ON documents(deleted);
  `);
};

export const documentQueries = {
  getAll: (): LocalDocument[] => {
    return db.getAllSync(
      "SELECT * FROM documents WHERE deleted = 0 ORDER BY created_at DESC",
    ) as LocalDocument[];
  },

  getById: (id: number): LocalDocument | null => {
    return db.getFirstSync(
      "SELECT * FROM documents WHERE id = ? AND deleted = 0",
      [id],
    ) as LocalDocument | null;
  },

  insert: (doc: Omit<LocalDocument, "id">): number => {
    const safeTitle = doc.title ?? "";
    const safeContent = doc.content ?? "";

    const result = db.runSync(
      `INSERT INTO documents (
        server_id, title, content, word_count, 
        original_url, created_at, updated_at, synced, deleted, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        doc.server_id,
        safeTitle,
        safeContent,
        doc.word_count || 0,
        doc.original_url || "",
        doc.created_at,
        doc.updated_at,
        doc.synced,
        doc.deleted,
        doc.tags || "[]",
      ],
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
    if (doc.tags !== undefined) {
      fields.push("tags = ?");
      values.push(doc.tags);
    }

    // Siempre actualizar updated_at y synced
    fields.push("updated_at = ?", "synced = ?");
    values.push(new Date().toISOString(), doc.server_id ? 1 : 0);

    values.push(id);

    db.runSync(
      `UPDATE documents SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  },

  softDelete: (id: number) => {
    const now = new Date().toISOString();
    db.runSync(
      "UPDATE documents SET deleted = 1, synced = 0, updated_at = ? WHERE id = ?",
      [now, id],
    );
  },

  getUnsyncedDocuments: (): LocalDocument[] => {
    return db.getAllSync(
      "SELECT * FROM documents WHERE synced = 0 AND deleted = 0",
    ) as LocalDocument[];
  },
};

export const syncQueueQueries = {
  enqueue: (documentId: number | null, action: string, data: any) => {
    const now = new Date().toISOString();
    db.runSync(
      "INSERT INTO sync_queue (document_id, action, data, created_at, status, attempts) VALUES (?, ?, ?, ?, 'pending', 0)",
      [documentId, action, JSON.stringify(data), now],
    );

    syncQueueQueries.compactForDocument(documentId, action);
  },

  getPending: (): SyncQueueItem[] => {
    return db.getAllSync(
      `SELECT * FROM sync_queue
       WHERE status IN ('pending', 'retry')
         AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
       ORDER BY created_at ASC`,
      [new Date().toISOString()],
    ) as SyncQueueItem[];
  },

  getStats: () => {
    const result = db.getFirstSync(
      `SELECT
         SUM(CASE WHEN status IN ('pending', 'retry') THEN 1 ELSE 0 END) as active_count,
         SUM(CASE WHEN status IN ('pending', 'retry') AND (next_attempt_at IS NULL OR next_attempt_at <= ?) THEN 1 ELSE 0 END) as ready_count,
         SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count
       FROM sync_queue`,
      [new Date().toISOString()],
    ) as {
      active_count: number | null;
      ready_count: number | null;
      failed_count: number | null;
    } | null;

    return {
      activeCount: result?.active_count ?? 0,
      readyCount: result?.ready_count ?? 0,
      failedCount: result?.failed_count ?? 0,
    };
  },

  updateRetry: (id: number, attempts: number, nextAttemptAt: string, error: string) => {
    db.runSync(
      "UPDATE sync_queue SET status = 'retry', attempts = ?, next_attempt_at = ?, last_error = ? WHERE id = ?",
      [attempts, nextAttemptAt, error, id],
    );
  },

  markFailed: (id: number, error: string) => {
    db.runSync(
      "UPDATE sync_queue SET status = 'failed', last_error = ? WHERE id = ?",
      [error, id],
    );
  },

  dequeue: (id: number) => {
    db.runSync("DELETE FROM sync_queue WHERE id = ?", [id]);
  },

  getNextRetryAt: (): string | null => {
    const result = db.getFirstSync(
      `SELECT next_attempt_at
       FROM sync_queue
       WHERE status = 'retry'
         AND next_attempt_at IS NOT NULL
       ORDER BY next_attempt_at ASC
       LIMIT 1`,
    ) as { next_attempt_at: string | null } | null;

    return result?.next_attempt_at ?? null;
  },

  replaceCreateData: (documentId: number, data: unknown) => {
    db.runSync(
      `UPDATE sync_queue
       SET data = ?, status = 'pending', attempts = 0, next_attempt_at = NULL, last_error = NULL
       WHERE id = (
         SELECT id FROM sync_queue
         WHERE document_id = ? AND action = 'CREATE'
         ORDER BY created_at ASC
         LIMIT 1
       )`,
      [JSON.stringify(data), documentId],
    );
  },

  getCreateData: (documentId: number) => {
    const result = db.getFirstSync(
      `SELECT data
       FROM sync_queue
       WHERE document_id = ? AND action = 'CREATE'
       ORDER BY created_at ASC
       LIMIT 1`,
      [documentId],
    ) as { data: string } | null;

    return result?.data ?? null;
  },

  hasCreateForDocument: (documentId: number) => {
    const result = db.getFirstSync(
      `SELECT COUNT(*) as create_count
       FROM sync_queue
       WHERE document_id = ? AND action = 'CREATE'`,
      [documentId],
    ) as { create_count: number } | null;

    return (result?.create_count ?? 0) > 0;
  },

  compactForDocument: (documentId: number | null, action: string) => {
    if (documentId === null) return;

    if (action === "DELETE") {
      db.runSync(
        "DELETE FROM sync_queue WHERE document_id = ? AND action IN ('CREATE', 'UPDATE')",
        [documentId],
      );
    }

    if (action === "UPDATE") {
      db.runSync(
        `DELETE FROM sync_queue
         WHERE document_id = ?
           AND action = 'UPDATE'
           AND id != (
             SELECT id FROM sync_queue
             WHERE document_id = ? AND action = 'UPDATE'
             ORDER BY id DESC
             LIMIT 1
           )`,
        [documentId, documentId],
      );
    }
  },
};

export const documentSyncQueries = {
  setStatus: (id: number, status: "synced" | "pending" | "error" | "conflict", error?: string) => {
    db.runSync(
      "UPDATE documents SET sync_status = ?, last_sync_error = ? WHERE id = ?",
      [status, error ?? null, id],
    );
  },
};
