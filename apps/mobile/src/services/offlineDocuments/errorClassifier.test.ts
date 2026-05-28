import { classifySyncError, isRetryableError } from "./errorClassifier";

describe("errorClassifier", () => {
  it("classifies retryable network errors", () => {
    expect(classifySyncError(new Error("Network request failed"))).toBe("network");
    expect(isRetryableError("network")).toBe(true);
  });

  it("classifies conflict as non-retryable", () => {
    expect(classifySyncError(new Error("Version conflict detected"))).toBe("conflict");
    expect(isRetryableError("conflict")).toBe(false);
  });
});
