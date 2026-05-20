import { renderHook, act } from "@testing-library/react-native";
import type { Document } from "@documind/types";
import { useDocumentFilters } from "./useDocumentFilters";

const documents: Document[] = [
  {
    id: 1,
    title: "Álgebra básica",
    content: "Introducción a ecuaciones",
    renderedHtml: "",
    rawText: "",
    sourceType: "file",
    original_url: "file://doc-1",
    word_count: 10,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    tags: ["math", "school"],
  },
  {
    id: 2,
    title: "Historia universal",
    content: "Resumen de la edad media",
    renderedHtml: "",
    rawText: "",
    sourceType: "file",
    original_url: "file://doc-2",
    word_count: 20,
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    tags: ["history"],
  },
];

describe("useDocumentFilters", () => {
  test("filters by normalized search query", () => {
    const { result } = renderHook(() => useDocumentFilters({ documents }));

    act(() => {
      result.current.setSearchQuery("algebra");
    });

    expect(result.current.filteredDocuments).toHaveLength(1);
    expect(result.current.filteredDocuments[0]?.id).toBe(1);
  });

  test("toggles tag filters and keeps created_at desc order", () => {
    const { result } = renderHook(() => useDocumentFilters({ documents }));

    expect(result.current.availableTags).toEqual(["history", "math", "school"]);

    act(() => {
      result.current.toggleTagFilter("history");
    });

    expect(result.current.filteredDocuments).toHaveLength(1);
    expect(result.current.filteredDocuments[0]?.id).toBe(2);
  });
});
