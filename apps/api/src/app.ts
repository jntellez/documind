import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth";
import documentChatRoutes from "./routes/document-chat";
import documentRoutes from "./routes/document";

type CreateAppOptions = {
  withFeatureRoutes?: boolean;
};

export function createApp(options: CreateAppOptions = {}) {
  const { withFeatureRoutes = true } = options;
  const app = new Hono();

  app.use("*", logger());
  app.use("*", cors());

  app.get("/", (c) => c.text("Documind API is running 🚀"));
  app.get("/api", (c) => c.json({ success: true }));

  if (withFeatureRoutes) {
    app.route("/api", documentRoutes);
    app.route("/api", documentChatRoutes);
    app.route("/auth", authRoutes);
  }

  app.get("/api/*", (c) => c.json({ message: "Not found" }, 404));
  app.notFound((c) => c.json({ message: "Not Found" }, 404));

  return app;
}
