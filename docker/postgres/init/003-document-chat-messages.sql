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
