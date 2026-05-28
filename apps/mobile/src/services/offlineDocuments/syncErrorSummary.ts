const MAX_SYNC_ERROR_LENGTH = 120;

export function summarizeSyncError(error: unknown): string {
  const baseMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown sync error";

  const compactMessage = baseMessage.replace(/\s+/g, " ").trim();

  if (!compactMessage) {
    return "Sync failed";
  }

  if (compactMessage.length <= MAX_SYNC_ERROR_LENGTH) {
    return compactMessage;
  }

  return `${compactMessage.slice(0, MAX_SYNC_ERROR_LENGTH - 1)}…`;
}
