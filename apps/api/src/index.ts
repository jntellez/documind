import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth";
import { config } from "./config";
import documentRoutes from "./routes/document";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => c.text("Documind API is running 🚀"));
app.get("/api", (c) => c.json({ success: true }));

app.route("/api", documentRoutes);
app.route("/auth", authRoutes);

app.get("/api/*", (c) => c.json({ message: "Not found" }, 404));
app.notFound((c) => c.json({ message: "Not Found" }, 404));

const server = Bun.serve({
  hostname: config.host,
  port: config.port,
  fetch: app.fetch,
});

console.log(`Server run in ${server.url} (bind: ${config.host}:${config.port})`);
