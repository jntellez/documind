export type UsageEntry = {
  count: number;
  limit: number;
  resetAt: Date;
};

export const DEFAULT_USAGE_LIMITS = {
  guestProcessing: 5,
  authProcessing: 12,
  chat: 20,
  documents: 30,
} as const;

export function formatResetTime(resetAt: Date): string {
  const now = new Date();
  const diffMs = resetAt.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Resets soon";
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `Resets in ${hours}h ${minutes}m`;
  }

  return `Resets in ${minutes}m`;
}

export function buildUsageTooltipMessage(
  label: string,
  usage: UsageEntry,
  hasSyncedResetAt: boolean,
) {
  const resetMessage = hasSyncedResetAt
    ? formatResetTime(usage.resetAt)
    : "Resets at midnight UTC.";

  return `${usage.count}/${usage.limit} ${label} today. ${resetMessage}`;
}

export function withFallbackUsage(
  usage: UsageEntry | null,
  fallbackLimit: number,
  resetAt: Date | null,
): UsageEntry {
  return usage ?? {
    count: 0,
    limit: fallbackLimit,
    resetAt: resetAt ?? new Date(),
  };
}
