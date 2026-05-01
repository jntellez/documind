# api-fastapi (Actividad 8 · Fase 2)

Minimal FastAPI alternative backend for Documind, separate from the current `apps/api` (Bun + Hono).

## Endpoints

- `GET /health` → basic health check
- `GET /documents?limit=5` → returns a small list from `documents`
- `POST /demo-documents` → inserts one demo row into `documents` using first existing `users.id`

## Requirements

- Python 3.11+
- Access to the same PostgreSQL database used by the main API
- `DATABASE_URL` environment variable set

## Setup

```bash
cd apps/api-fastapi
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Set DB URL in your shell (do **not** commit secrets):

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/documind"
```

## Run

From repo root (setup + run):

```bash
pnpm fastapi:setup
pnpm fastapi:dev
```

Or directly:

```bash
cd apps/api-fastapi
python3 main.py
```

Server default: `http://localhost:8010`

## Quick test

```bash
curl http://localhost:8010/health
curl "http://localhost:8010/documents?limit=3"
curl -X POST http://localhost:8010/demo-documents
```

## Screenshot placeholders

Add screenshots in this folder and update the links:

- `![Health endpoint](./screenshots/health.png)`
- `![Documents endpoint](./screenshots/documents.png)`
- `![Demo insert endpoint](./screenshots/demo-insert.png)`

## Notes / Caveats

- `POST /demo-documents` requires at least one row in `users`; otherwise it returns `409`.
- This is intentionally minimal and does not replicate JWT/auth behavior from `apps/api`.
