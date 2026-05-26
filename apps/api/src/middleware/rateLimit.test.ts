import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createRateLimit } from "./rateLimit";

describe("createRateLimit", () => {
  test("does not collapse all clients into one bucket when forwarding headers are missing", async () => {
    const app = new Hono();
    const rateLimit = createRateLimit({
      key: "test-limit",
      windowMs: 60_000,
      max: 1,
    });

    app.get("/limited", rateLimit, (c) => c.json({ ok: true }));

    const firstClientResponse = await app.request("/limited", {
      headers: {
        "user-agent": "client-a",
      },
    });

    const secondClientResponse = await app.request("/limited", {
      headers: {
        "user-agent": "client-b",
      },
    });

    expect(firstClientResponse.status).toBe(200);
    expect(secondClientResponse.status).toBe(200);
  });

  test("enforces limits for repeated requests from same client fingerprint", async () => {
    const app = new Hono();
    const rateLimit = createRateLimit({
      key: "test-limit-same-client",
      windowMs: 60_000,
      max: 1,
    });

    app.get("/limited", rateLimit, (c) => c.json({ ok: true }));

    const firstResponse = await app.request("/limited", {
      headers: {
        "user-agent": "same-client",
      },
    });
    const secondResponse = await app.request("/limited", {
      headers: {
        "user-agent": "same-client",
      },
    });

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(429);
    expect(secondResponse.headers.get("Retry-After")).toBeTruthy();
  });
});
