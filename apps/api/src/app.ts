import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { resolveCorsOrigin } from "./lib/corsPolicy";
import { sanitizeErrorMessage } from "./lib/httpErrors";
import authRoutes from "./routes/auth";
import documentChatRoutes from "./routes/document-chat";
import documentRoutes from "./routes/document";
import healthRoutes from "./routes/health";

type CreateAppOptions = {
  withFeatureRoutes?: boolean;
};

export function createApp(options: CreateAppOptions = {}) {
  const { withFeatureRoutes = true } = options;
  const app = new Hono();

  app.use("*", logger());
  app.use("*", cors({
    origin: resolveCorsOrigin,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }));

  app.get("/", (c) => c.json({ message: "Documind API is running 🚀" }));
  app.get("/api", (c) => c.json({ success: true }));
  app.route("/", healthRoutes);

  if (withFeatureRoutes) {
    app.route("/api", documentRoutes);
    app.route("/api", documentChatRoutes);
    app.route("/auth", authRoutes);
  }

  app.get("/api/*", (c) => c.json({ message: "Not found" }, 404));
  app.notFound((c) => c.json({ message: "Not Found" }, 404));
  app.onError((error, c) => {
    console.error("Unhandled error:", error);
    return c.json({ error: sanitizeErrorMessage(error) }, 500);
  });

  return app;
}
