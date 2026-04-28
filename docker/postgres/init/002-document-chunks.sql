-- Fresh Docker volumes will apply this automatically.
-- Existing databases must apply this file manually because there is no migration runner yet.

CREATE TABLE IF NOT EXISTS document_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id
  ON document_chunks (document_id);

CREATE INDEX IF NOT EXISTS idx_document_chunks_search_english
  ON document_chunks
  USING GIN (to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_document_chunks_search_simple
  ON document_chunks
  USING GIN (to_tsvector('simple', content));
