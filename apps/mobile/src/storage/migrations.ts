import * as SQLite from "expo-sqlite";
import { BACKFILL_PENDING_SYNC_STATUS_SQL } from "./migrationBackfill";

const db = SQLite.openDatabaseSync("documind.db");

export const DB_VERSION = 3;

function isDuplicateColumnError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("duplicate column name") || message.includes("already exists");
}

function tryAlter(statement: string) {
  try {
    db.execSync(statement);
    return true;
  } catch (error) {
    if (isDuplicateColumnError(error)) {
      return true;
    }
    return false;
  }
}

function tryExec(statement: string) {
  try {
    db.execSync(statement);
    return true;
  } catch {
    return false;
  }
}

export const runMigrations = () => {
  let currentVersion = 0;
  try {
    const result = db.getFirstSync("PRAGMA user_version") as {
      user_version: number;
    };
    currentVersion = result.user_version;
  } catch (error) {}

  if (currentVersion < 1 && migration_v1()) {
    db.execSync("PRAGMA user_version = 1");
    currentVersion = 1;
  }

  // <-- Ejecutar nueva migración si la versión es menor a 2
  if (currentVersion < 2 && migration_v2()) {
    db.execSync("PRAGMA user_version = 2");
    currentVersion = 2;
  }

  if (currentVersion < 3 && migration_v3()) {
    db.execSync("PRAGMA user_version = 3");
    currentVersion = 3;
  }
};

const migration_v1 = () => {
  // Ya se ejecuta en initDatabase
  return true;
};

// <-- Añadir la migración que altera la tabla existente
const migration_v2 = () => {
  return tryAlter("ALTER TABLE documents ADD COLUMN tags TEXT DEFAULT '[]';");
};

const migration_v3 = () => {
  const alterStatements = [
    "ALTER TABLE documents ADD COLUMN sync_status TEXT DEFAULT 'synced';",
    "ALTER TABLE documents ADD COLUMN last_sync_error TEXT;",
    "ALTER TABLE sync_queue ADD COLUMN status TEXT DEFAULT 'pending';",
    "ALTER TABLE sync_queue ADD COLUMN attempts INTEGER DEFAULT 0;",
    "ALTER TABLE sync_queue ADD COLUMN next_attempt_at TEXT;",
    "ALTER TABLE sync_queue ADD COLUMN last_error TEXT;",
  ];

  const altered = alterStatements.every((statement) => tryAlter(statement));
  if (!altered) {
    return false;
  }

  return tryExec(BACKFILL_PENDING_SYNC_STATUS_SQL);
};

export const migrationInternals = {
  isDuplicateColumnError,
};
