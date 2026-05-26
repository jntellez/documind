import { Hono } from "hono";
import pg from "../db";
import { sanitizeErrorMessage } from "../lib/httpErrors";

const healthRoutes = new Hono();

healthRoutes.get("/health", async (c) => {
  try {
    await pg`SELECT 1 as ok`;

    return c.json({
      ok: true,
      status: "healthy",
      services: {
        api: "up",
        database: "up",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return c.json(
      {
        ok: false,
        status: "degraded",
        services: {
          api: "up",
          database: "down",
        },
        error: sanitizeErrorMessage(error, "Database unavailable"),
      },
      503,
    );
  }
});

export default healthRoutes;
