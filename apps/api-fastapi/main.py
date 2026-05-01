import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import asyncpg
from fastapi import FastAPI, HTTPException, Query
from dotenv import load_dotenv


load_dotenv(Path(__file__).with_name(".env"))


class AppState:
    pool: asyncpg.Pool | None = None


state = AppState()


@asynccontextmanager
async def lifespan(_: FastAPI):
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required")

    state.pool = await asyncpg.create_pool(
        database_url,
        min_size=1,
        max_size=3,
        ssl="require",
    )
    try:
        yield
    finally:
        if state.pool:
            await state.pool.close()


app = FastAPI(title="Documind FastAPI Alternative", version="0.1.0", lifespan=lifespan)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Documind FastAPI Alternative API"}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/documents")
async def list_documents(limit: int = Query(default=5, ge=1, le=20)) -> dict[str, Any]:
    if not state.pool:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    rows = await state.pool.fetch(
        """
        SELECT id, title, original_url, word_count, created_at, updated_at, user_id, tags
        FROM documents
        ORDER BY created_at DESC
        LIMIT $1
        """,
        limit,
    )

    documents = [dict(row) for row in rows]
    return {"count": len(documents), "documents": documents}


@app.post("/demo-documents")
async def create_demo_document() -> dict[str, Any]:
    if not state.pool:
        raise HTTPException(status_code=500, detail="Database pool is not initialized")

    user_row = await state.pool.fetchrow("SELECT id FROM users ORDER BY id ASC LIMIT 1")
    if user_row is None:
        raise HTTPException(
            status_code=409,
            detail="No users found. Create a user first so demo document can reference user_id.",
        )

    user_id = int(user_row["id"])
    now = datetime.now(timezone.utc)
    content = "FastAPI demo document for Actividad 8 Fase 2."

    row = await state.pool.fetchrow(
        """
        INSERT INTO documents (
            title,
            content,
            original_url,
            word_count,
            created_at,
            updated_at,
            user_id,
            tags
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, title, original_url, word_count, created_at, updated_at, user_id, tags
        """,
        "Demo document (FastAPI)",
        content,
        "https://example.com/demo-fastapi",
        len(content.split()),
        now,
        now,
        user_id,
        ["demo", "fastapi"],
    )

    return {"success": True, "document": dict(row) if row else None}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8010, reload=True)
