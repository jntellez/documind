import { describe, expect, test } from "bun:test";

process.env.JWT_SECRET ??= "test-jwt-secret";
process.env.DATABASE_URL ??= "postgres://localhost:5432/documind_test";
process.env.AI_GATEWAY_URL ??= "http://localhost:9999";
process.env.GOOGLE_CLIENT_ID ??= "test-google-id";
process.env.GOOGLE_CLIENT_SECRET ??= "test-google-secret";
process.env.GITHUB_CLIENT_ID ??= "test-github-id";
process.env.GITHUB_CLIENT_SECRET ??= "test-github-secret";

const { createApp } = await import("./app");

describe("createApp core routes", () => {
  const app = createApp({ withFeatureRoutes: false });

  test("GET / returns API banner", async () => {
    const response = await app.request("/");

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Documind API is running");
  });

  test("GET /api returns success contract", async () => {
    const response = await app.request("/api");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });

  test("GET /api/unknown returns API scoped 404 payload", async () => {
    const response = await app.request("/api/unknown");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: "Not found" });
  });
});
