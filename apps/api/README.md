# Documind API

Backend service for the Documind monorepo, running on **Bun** while the monorepo remains managed by **pnpm** workspaces.

## Run

From the repo root:

```bash
pnpm install
pnpm api:dev
```

Or directly for this workspace:

```bash
pnpm --filter @documind/api dev
```

## Environment

This app expects the same runtime variables used by the original standalone API, including:

- `JWT_SECRET`
- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `HOST` (optional, default `0.0.0.0`)
- `PORT` (optional, default `3000`)

Do not commit `.env` files or secrets into the monorepo.
