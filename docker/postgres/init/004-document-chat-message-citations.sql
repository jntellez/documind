-- Fresh Docker volumes will apply this automatically.
-- Existing databases must apply this file manually because there is no migration runner yet.

ALTER TABLE document_chat_messages
  ADD COLUMN IF NOT EXISTS citations JSONB;
