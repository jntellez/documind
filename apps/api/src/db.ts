import postgres from "postgres";
import { config } from "./config";

const sql = postgres(config.dbUrl, {
  ssl: "require",
  prepare: false,
});

const pg: any = Object.assign(sql, {
  close: () => sql.end({ timeout: 5 }),
});

export default pg;
