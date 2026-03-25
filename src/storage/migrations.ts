import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("documind.db");

export const DB_VERSION = 2;

export const runMigrations = () => {
  let currentVersion = 0;
  try {
    const result = db.getFirstSync("PRAGMA user_version") as {
      user_version: number;
    };
    currentVersion = result.user_version;
  } catch (error) {}

  if (currentVersion < 1) {
    migration_v1();
  }

  // <-- Ejecutar nueva migración si la versión es menor a 2
  if (currentVersion < 2) {
    migration_v2();
  }

  db.execSync(`PRAGMA user_version = ${DB_VERSION}`);
};

const migration_v1 = () => {
  // Ya se ejecuta en initDatabase
};

// <-- Añadir la migración que altera la tabla existente
const migration_v2 = () => {
  db.execSync(`
    ALTER TABLE documents ADD COLUMN tags TEXT DEFAULT '[]';
  `);
};
