import { canAddDocumentTag, MAX_DOCUMENT_TAGS } from "./tagLimits";

describe("tagLimits", () => {
  test("allows adding a tag while under max", () => {
    expect(canAddDocumentTag(["a", "b", "c", "d"])).toBe(true);
  });

  test("blocks adding a tag at max", () => {
    expect(MAX_DOCUMENT_TAGS).toBe(5);
    expect(canAddDocumentTag(["a", "b", "c", "d", "e"])).toBe(false);
  });
});
