export const BACKFILL_PENDING_SYNC_STATUS_SQL = `
  UPDATE documents
  SET sync_status = 'pending'
  WHERE id IN (
    SELECT DISTINCT document_id
    FROM sync_queue
    WHERE document_id IS NOT NULL
  );
`;
