import type { Context, Next } from "hono";
import { getConnInfo } from "hono/bun";

type RateLimitOptions = {
  key: string;
  windowMs: number;
  max: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
let lastCleanupAt = 0;

function cleanupExpiredBuckets(now: number) {
  if (now - lastCleanupAt < 60_000) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  lastCleanupAt = now;
}

function getClientIp(c: Context) {
  const forwardedFor = c.req.header("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  const realIp = c.req.header("x-real-ip") ?? c.req.header("cf-connecting-ip");

  if (realIp) {
    return realIp;
  }

  try {
    const remoteAddress = getConnInfo(c).remote.address;

    if (remoteAddress) {
      return remoteAddress;
    }
  } catch {
    // Bun connection info may be unavailable in test environments.
  }

  const authHeader = c.req.header("authorization");

  if (authHeader) {
    return `auth:${authHeader}`;
  }

  const userAgent = c.req.header("user-agent");
  const acceptLanguage = c.req.header("accept-language");

  if (userAgent || acceptLanguage) {
    return `fp:${userAgent ?? "na"}:${acceptLanguage ?? "na"}`;
  }

  return "unknown";
}

export function createRateLimit(options: RateLimitOptions) {
  const { key, windowMs, max } = options;

  return async function rateLimitMiddleware(c: Context, next: Next) {
    const now = Date.now();
    cleanupExpiredBuckets(now);
    const bucketKey = `${key}:${getClientIp(c)}`;
    const existing = buckets.get(bucketKey);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + windowMs;
      buckets.set(bucketKey, {
        count: 1,
        resetAt,
      });

      c.header("X-RateLimit-Limit", String(max));
      c.header("X-RateLimit-Remaining", String(Math.max(0, max - 1)));
      c.header("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

      await next();
      return;
    }

    if (existing.count >= max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      );

      c.header("Retry-After", String(retryAfterSeconds));
      c.header("X-RateLimit-Limit", String(max));
      c.header("X-RateLimit-Remaining", "0");
      c.header("X-RateLimit-Reset", String(Math.ceil(existing.resetAt / 1000)));

      return c.json({ error: "Too many requests" }, 429);
    }

    existing.count += 1;
    const remaining = Math.max(0, max - existing.count);
    c.header("X-RateLimit-Limit", String(max));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(Math.ceil(existing.resetAt / 1000)));
    await next();
  };
}
