/**
 * Usage tracker service — extracts and stores rate limit headers from API responses.
 *
 * Event-based pub/sub pattern: components subscribe via `subscribe()` and get notified
 * when headers are updated. No React context needed — keeps the service framework-agnostic.
 */

export type UsageType = "processing" | "chat";

export type UsageData = {
  limit: number;
  remaining: number;
  resetAt: Date;
};

const store = new Map<UsageType, UsageData>();
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Update usage data from response headers.
 * Only updates if both limit and remaining headers are present.
 */
export function updateUsage(headers: Headers, type: UsageType) {
  const limitHeader = headers.get("X-RateLimit-Limit");
  const remainingHeader = headers.get("X-RateLimit-Remaining");
  const resetHeader = headers.get("X-RateLimit-Reset");

  if (!limitHeader || !remainingHeader) {
    return;
  }

  const limit = parseInt(limitHeader, 10);
  const remaining = parseInt(remainingHeader, 10);

  if (!Number.isFinite(limit) || !Number.isFinite(remaining)) {
    return;
  }

  const resetAt = resetHeader
    ? new Date(parseInt(resetHeader, 10) * 1000)
    : new Date();

  store.set(type, { limit, remaining, resetAt });
  notifyListeners();
}

/**
 * Subscribe to usage updates. Returns an unsubscribe function.
 */
export function subscribeUsage(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Get current usage data for a type. Returns undefined if no data yet.
 */
export function getUsage(type: UsageType): UsageData | undefined {
  return store.get(type);
}

/**
 * Get all current usage data.
 */
export function getAllUsage(): ReadonlyMap<UsageType, UsageData> {
  return store;
}

/**
 * Clear all usage data (e.g., on sign out).
 */
export function clearUsage() {
  store.clear();
  notifyListeners();
}
