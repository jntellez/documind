export type SyncErrorType =
  | "network"
  | "auth"
  | "validation"
  | "conflict"
  | "not_found"
  | "server"
  | "unknown";

export function classifySyncError(error: unknown): SyncErrorType {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("network") || message.includes("fetch") || message.includes("timeout")) return "network";
  if (message.includes("unauthorized") || message.includes("forbidden") || message.includes("token")) return "auth";
  if (message.includes("conflict") || message.includes("version")) return "conflict";
  if (message.includes("required") || message.includes("invalid") || message.includes("unprocessable")) return "validation";
  if (message.includes("not found")) return "not_found";
  if (message.includes("internal") || message.includes("server")) return "server";

  return "unknown";
}

export function isRetryableError(type: SyncErrorType) {
  return type === "network" || type === "server" || type === "unknown";
}
