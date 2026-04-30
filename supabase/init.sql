-- Documind Supabase initialization script
-- Consolidated from docker/postgres/init/001..005 SQL files.

-- ==========================================
-- 001 - Base schema
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  original_url TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_documents_user_created_at
  ON documents (user_id, created_at DESC);

-- ==========================================
-- 002 - Document chunks
-- ==========================================
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

-- ==========================================
-- 003 - Document chat messages
-- ==========================================
-- Fresh Docker volumes will apply this automatically.
-- Existing databases must apply this file manually because there is no migration runner yet.

CREATE TABLE IF NOT EXISTS document_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_chat_messages_document_user_created_at
  ON document_chat_messages (document_id, user_id, created_at ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_document_chat_messages_user_created_at
  ON document_chat_messages (user_id, created_at DESC);

-- ==========================================
-- 004 - Document chat message citations
-- ==========================================
-- Fresh Docker volumes will apply this automatically.
-- Existing databases must apply this file manually because there is no migration runner yet.

ALTER TABLE document_chat_messages
  ADD COLUMN IF NOT EXISTS citations JSONB;

-- ==========================================
-- 005 - Document chunk embeddings
-- ==========================================
-- Fresh Docker volumes will apply this automatically.
-- Existing databases must apply this file manually because there is no migration runner yet.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS embedding vector;
