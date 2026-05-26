# Documind API

Backend service for the Documind monorepo, running on **Bun** while the monorepo remains managed by **pnpm** workspaces.

## Install and run

From the repo root:

```bash
pnpm install
pnpm api:dev
```

Or directly for this workspace:

```bash
pnpm --filter @documind/api dev
```

Without hot reload:

```bash
pnpm api:start
```

Typecheck:

```bash
pnpm api:typecheck
```

## Environment

Environment files live in this workspace:

- template: `apps/api/.env.example`
- local file: `apps/api/.env`

This app expects the same runtime variables used by the original standalone API, including:

- `JWT_SECRET`
- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `HOST` (optional, default `0.0.0.0`)
- `PORT` (optional, default `3000`)
- `NODE_ENV` (optional, `production` enables hardened error responses)
- `CORS_ALLOWED_ORIGINS` (optional CSV list; required for browser clients in production)
- `RATE_LIMIT_WINDOW_MS` (optional, default `60000`)
- `AUTH_RATE_LIMIT_MAX` (optional, default `20`)
- `DOCUMENT_RATE_LIMIT_MAX` (optional, default `30`)
- `CHAT_RATE_LIMIT_MAX` (optional, default `60`)

Create the local file from the example and fill it with local values only.

Do not commit `.env` files or secrets into the monorepo.

## Health endpoint

- `GET /health`
- Returns `200` when API + DB are reachable
- Returns `503` when DB is unavailable

For monitor setup details (UptimeRobot free-plan friendly), see `docs/observability.md` at repo root.
