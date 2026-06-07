const requireEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const numberEnv = (name: string, fallback: number) => {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric environment variable: ${name}`);
  }

  return parsed;
};

const booleanEnv = (name: string, fallback: boolean) => {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`Invalid boolean environment variable: ${name}`);
};

const csvEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    return [] as string[];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

export const config = {
  nodeEnv,
  isProduction,
  host: process.env.HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? 3000),
  corsAllowedOrigins: csvEnv("CORS_ALLOWED_ORIGINS"),
  rateLimitWindowMs: numberEnv("RATE_LIMIT_WINDOW_MS", 60_000),
  authRateLimitMax: numberEnv("AUTH_RATE_LIMIT_MAX", 20),
  documentRateLimitMax: numberEnv("DOCUMENT_RATE_LIMIT_MAX", 30),
  chatRateLimitMax: numberEnv("CHAT_RATE_LIMIT_MAX", 60),
  jwtSecret: requireEnv("JWT_SECRET"),
  dbUrl: requireEnv("DATABASE_URL"),
  dbSsl: booleanEnv("DATABASE_SSL", false),
  aiGatewayUrl: requireEnv("AI_GATEWAY_URL"),
  aiGatewayTimeoutMs: numberEnv("AI_GATEWAY_TIMEOUT_MS", 15000),
  guestProcessingLimit: numberEnv("GUEST_PROCESSING_LIMIT", 5),
  authProcessingLimit: numberEnv("AUTH_PROCESSING_LIMIT", 12),
  savedDocumentsLimit: numberEnv("SAVED_DOCUMENTS_LIMIT", 30),
  tagsPerDocumentLimit: numberEnv("TAGS_PER_DOCUMENT_LIMIT", 5),
  chatLimit: numberEnv("CHAT_LIMIT", 20),
  google: {
    clientId: requireEnv("GOOGLE_CLIENT_ID"),
    clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    allowedClientIds: [] as string[],
  },
  github: {
    clientId: requireEnv("GITHUB_CLIENT_ID"),
    clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
  },
};

config.google.allowedClientIds = Array.from(
  new Set([config.google.clientId, ...csvEnv("GOOGLE_ALLOWED_CLIENT_IDS")]),
);
