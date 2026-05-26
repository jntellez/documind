import type { Context, Next } from "hono";
import { getConnInfo } from "hono/bun";
import pg from "../db";
import { getUsageCount, incrementUsage } from "../repositories/usage.repository";

type UsageLimitOptions = {
  guestMax: number;
  authMax: number;
  type: "processing" | "chat";
};

type JwtPayload = {
  sub?: string | number;
  id?: string | number;
};

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

function getUserIdFromPayload(payload: JwtPayload | undefined): number | undefined {
  if (!payload) return undefined;
  const id = Number(payload.sub || payload.id);
  return id && !Number.isNaN(id) ? id : undefined;
}

function secondsUntilMidnightUtc(): number {
  const now = new Date();
  const midnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 1000));
}

function buildErrorMessage(type: "processing" | "chat", isAuthenticated: boolean): string {
  if (type === "chat") {
    return "Daily chat limit reached";
  }
  return isAuthenticated
    ? "Daily processing limit reached"
    : "Daily processing limit reached for guest users";
}

export function createUsageLimit(options: UsageLimitOptions) {
  const { guestMax, authMax, type } = options;

  return async function usageLimitMiddleware(c: Context, next: Next) {
    const ip = getClientIp(c);
    const jwtPayload = c.get("jwtPayload") as JwtPayload | undefined;
    const userId = getUserIdFromPayload(jwtPayload);
    const isAuthenticated = !!userId;
    const max = isAuthenticated ? authMax : guestMax;

    const currentCount = await getUsageCount(pg, {
      userId,
      ip,
      type,
      date: new Date().toISOString().slice(0, 10),
    });

    if (currentCount >= max) {
      const retryAfter = secondsUntilMidnightUtc();
      c.header("Retry-After", String(retryAfter));
      c.header("X-RateLimit-Limit", String(max));
      c.header("X-RateLimit-Remaining", "0");
      c.header("X-RateLimit-Reset", String(retryAfter));

      return c.json({ error: buildErrorMessage(type, isAuthenticated) }, 429);
    }

    await incrementUsage(pg, { userId, ip, type });

    const newCount = currentCount + 1;
    const remaining = Math.max(0, max - newCount);
    c.header("X-RateLimit-Limit", String(max));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(secondsUntilMidnightUtc()));

    await next();
  };
}
