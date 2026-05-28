import { shouldAttemptPreFetchSync } from "./syncGuards";

describe("documentOperations pre-fetch sync guard", () => {
  it("does not attempt sync when there are no local creates", () => {
    expect(shouldAttemptPreFetchSync(false)).toBe(false);
  });

  it("attempts sync by default when local creates exist", () => {
    expect(shouldAttemptPreFetchSync(true)).toBe(true);
  });

  it("can explicitly skip pre-fetch sync to avoid loops", () => {
    expect(
      shouldAttemptPreFetchSync(true, { attemptSyncForLocalCreates: false }),
    ).toBe(false);
  });
});
