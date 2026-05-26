import { config } from "../config";

type SanitizedErrorPayload = {
  error: string;
  details?: string;
};

export function sanitizeErrorMessage(error: unknown, fallback = "Internal server error") {
  if (config.isProduction) {
    return fallback;
  }

  return error instanceof Error ? error.message : String(error);
}

export function maybeErrorDetails(error: unknown) {
  if (config.isProduction) {
    return undefined;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function buildSanitizedErrorPayload(
  error: unknown,
  fallback = "Internal server error",
): SanitizedErrorPayload {
  return {
    error: sanitizeErrorMessage(error, fallback),
    details: maybeErrorDetails(error),
  };
}
