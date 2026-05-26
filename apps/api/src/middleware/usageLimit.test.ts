import { describe, expect, test, beforeEach, mock } from "bun:test";

process.env.JWT_SECRET ??= "test-jwt-secret";
process.env.DATABASE_URL ??= "postgres://localhost:5432/documind_test";
process.env.AI_GATEWAY_URL ??= "http://localhost:9999";
process.env.GOOGLE_CLIENT_ID ??= "test-google-id";
process.env.GOOGLE_CLIENT_SECRET ??= "test-google-secret";
process.env.GITHUB_CLIENT_ID ??= "test-github-id";
process.env.GITHUB_CLIENT_SECRET ??= "test-github-secret";

import { Hono } from "hono";

// Mock the repository functions before loading usageLimit
const mockGetUsageCount = mock(() => Promise.resolve(0));
const mockIncrementUsage = mock(() => Promise.resolve([{ count: 1 }]));

mock.module("../repositories/usage.repository", () => ({
  getUsageCount: mockGetUsageCount,
  incrementUsage: mockIncrementUsage,
}));

const { createUsageLimit } = await import("./usageLimit");

describe("createUsageLimit", () => {
  beforeEach(() => {
    mockGetUsageCount.mockClear();
    mockIncrementUsage.mockClear();
  });

  test("allows request when usage is below limit for guest", async () => {
    mockGetUsageCount.mockImplementation(() => Promise.resolve(0));

    const app = new Hono();
    const usageLimit = createUsageLimit({
      type: "processing",
      guestMax: 5,
      authMax: 12,
    });

    app.get("/limited", usageLimit, (c) => c.json({ ok: true }));

    const response = await app.request("/limited");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(mockGetUsageCount).toHaveBeenCalled();
    expect(mockIncrementUsage).toHaveBeenCalled();
  });

  test("returns 429 when guest processing limit is exceeded", async () => {
    mockGetUsageCount.mockImplementation(() => Promise.resolve(5));

    const app = new Hono();
    const usageLimit = createUsageLimit({
      type: "processing",
      guestMax: 5,
      authMax: 12,
    });

    app.get("/limited", usageLimit, (c) => c.json({ ok: true }));

    const response = await app.request("/limited");

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe("Daily processing limit reached for guest users");
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });

  test("returns 429 when auth processing limit is exceeded", async () => {
    mockGetUsageCount.mockImplementation(() => Promise.resolve(12));

    const app = new Hono();
    const usageLimit = createUsageLimit({
      type: "processing",
      guestMax: 5,
      authMax: 12,
    });

    app.get("/limited", (c, next) => {
      c.set("jwtPayload", { sub: "123" });
      return next();
    }, usageLimit, (c) => c.json({ ok: true }));

    const response = await app.request("/limited");

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe("Daily processing limit reached");
  });

  test("returns 429 with chat-specific message for chat limit", async () => {
    mockGetUsageCount.mockImplementation(() => Promise.resolve(20));

    const app = new Hono();
    const usageLimit = createUsageLimit({
      type: "chat",
      guestMax: 0,
      authMax: 20,
    });

    app.get("/chat", (c, next) => {
      c.set("jwtPayload", { sub: "123" });
      return next();
    }, usageLimit, (c) => c.json({ ok: true }));

    const response = await app.request("/chat");

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe("Daily chat limit reached");
  });

  test("sets proper rate limit headers on success", async () => {
    mockGetUsageCount.mockImplementation(() => Promise.resolve(3));

    const app = new Hono();
    const usageLimit = createUsageLimit({
      type: "processing",
      guestMax: 5,
      authMax: 12,
    });

    app.get("/limited", usageLimit, (c) => c.json({ ok: true }));

    const response = await app.request("/limited");

    expect(response.status).toBe(200);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("1");
    expect(response.headers.get("X-RateLimit-Reset")).toBeTruthy();
  });
});
