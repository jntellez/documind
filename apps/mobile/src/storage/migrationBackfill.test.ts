import { BACKFILL_PENDING_SYNC_STATUS_SQL } from "./migrationBackfill";

describe("migration pending-status backfill SQL", () => {
  it("marks documents with queued sync rows as pending", () => {
    expect(BACKFILL_PENDING_SYNC_STATUS_SQL).toContain("UPDATE documents");
    expect(BACKFILL_PENDING_SYNC_STATUS_SQL).toContain("SET sync_status = 'pending'");
    expect(BACKFILL_PENDING_SYNC_STATUS_SQL).toContain("SELECT DISTINCT document_id");
    expect(BACKFILL_PENDING_SYNC_STATUS_SQL).toContain("FROM sync_queue");
  });
});
