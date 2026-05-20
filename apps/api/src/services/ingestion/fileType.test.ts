import { describe, expect, test } from "bun:test";
import { detectSupportedFileType } from "./fileType";

describe("detectSupportedFileType", () => {
  test("detects supported formats by mime type", () => {
    expect(
      detectSupportedFileType(
        new File(["%PDF"], "unknown.bin", { type: "application/pdf" }),
      ),
    ).toBe("pdf");

    expect(
      detectSupportedFileType(
        new File(["doc"], "unknown.bin", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
      ),
    ).toBe("docx");
  });

  test("detects supported formats by filename extension", () => {
    expect(detectSupportedFileType(new File([""], "slides.PPTX", { type: "" }))).toBe(
      "pptx",
    );
  });

  test("returns null for unsupported files", () => {
    expect(detectSupportedFileType(new File(["hello"], "notes.txt", { type: "text/plain" }))).toBe(
      null,
    );
  });
});
