import { nextBackoffDate, shouldFailPermanently } from "./syncQueue";

describe("syncQueue", () => {
  it("generates increasing backoff values", () => {
    const now = Date.now();
    const first = new Date(nextBackoffDate(1)).getTime();
    const second = new Date(nextBackoffDate(2)).getTime();

    expect(first).toBeGreaterThan(now);
    expect(second).toBeGreaterThan(first);
  });

  it("fails permanently after max retries", () => {
    expect(shouldFailPermanently(4)).toBe(false);
    expect(shouldFailPermanently(5)).toBe(true);
  });
});
