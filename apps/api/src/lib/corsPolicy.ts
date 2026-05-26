import { config } from "../config";

const devCorsFallback = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8081",
];

const allowedOrigins = config.corsAllowedOrigins.length > 0
  ? config.corsAllowedOrigins
  : config.isProduction
    ? []
    : devCorsFallback;

export function resolveCorsOrigin(origin?: string) {
  if (!origin) {
    return undefined;
  }

  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  return undefined;
}
