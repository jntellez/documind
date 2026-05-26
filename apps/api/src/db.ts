import postgres from "postgres";
import { config } from "./config";

const sql = postgres(config.dbUrl, {
  ssl: config.dbSsl ? "require" : false,
  prepare: false,
});

async function ensureUsageTrackingTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS usage_tracking (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      ip_address TEXT,
      usage_type TEXT NOT NULL CHECK (usage_type IN ('processing', 'chat')),
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      count INTEGER NOT NULL DEFAULT 0,
      UNIQUE(user_id, usage_type, date),
      UNIQUE(ip_address, usage_type, date)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_usage_tracking_lookup
    ON usage_tracking(usage_type, date, user_id, ip_address)
  `;
}

ensureUsageTrackingTable().catch((error) => {
  console.error("Failed to ensure usage_tracking table:", error);
});

const pg: any = Object.assign(sql, {
  close: () => sql.end({ timeout: 5 }),
});

export default pg;
