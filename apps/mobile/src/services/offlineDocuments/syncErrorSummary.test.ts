import { summarizeSyncError } from "./syncErrorSummary";

describe("summarizeSyncError", () => {
  test("returns compacted error text", () => {
    expect(summarizeSyncError("  timeout\n\nfrom server  ")).toBe("timeout from server");
  });

  test("truncates oversized errors", () => {
    const longMessage = "a".repeat(200);
    const result = summarizeSyncError(longMessage);

    expect(result.length).toBeLessThanOrEqual(120);
    expect(result.endsWith("…")).toBe(true);
  });
});
