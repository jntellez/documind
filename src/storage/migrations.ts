import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("documind.db");

export const DB_VERSION = 1;

export const runMigrations = () => {
  // Obtener versión actual
  let currentVersion = 0;
  try {
    const result = db.getFirstSync("PRAGMA user_version") as {
      user_version: number;
    };
    currentVersion = result.user_version;
  } catch (error) {}

  // Ejecutar migraciones necesarias
  if (currentVersion < 1) {
    migration_v1();
  }

  // Actualizar versión
  db.execSync(`PRAGMA user_version = ${DB_VERSION}`);
};

const migration_v1 = () => {
  // Ya se ejecuta en initDatabase
};

// Ejemplo de migración futura:
// const migration_v2 = () => {
//   db.execSync(`
//     ALTER TABLE documents ADD COLUMN tags TEXT;
//   `);
// };
