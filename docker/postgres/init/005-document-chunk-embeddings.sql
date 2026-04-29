-- Fresh Docker volumes will apply this automatically.
-- Existing databases must apply this file manually because there is no migration runner yet.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS embedding vector;
