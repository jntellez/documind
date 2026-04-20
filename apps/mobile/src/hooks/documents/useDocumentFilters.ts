import { useCallback, useMemo, useState } from "react";
import type { Document } from "@documind/types";

import { normalizeText } from "@/utils/text";

type UseDocumentFiltersOptions = {
  documents: Document[];
};

export function useDocumentFilters({ documents }: UseDocumentFiltersOptions) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();

    documents.forEach((doc) => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach((tag) => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
  }, [documents]);

  const toggleTagFilter = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((value) => value !== tag) : [...prev, tag],
    );
  }, []);

  const filteredDocuments = useMemo(() => {
    let result = documents;

    if (searchQuery.trim()) {
      const normalizedQuery = normalizeText(searchQuery);
      result = result.filter((doc) => {
        const normalizedTitle = normalizeText(doc.title);
        const normalizedContent = doc.content ? normalizeText(doc.content) : "";

        return (
          normalizedTitle.includes(normalizedQuery) ||
          normalizedContent.includes(normalizedQuery)
        );
      });
    }

    if (selectedTags.length > 0) {
      result = result.filter(
        (doc) => doc.tags && doc.tags.some((tag) => selectedTags.includes(tag)),
      );
    }

    return result.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [documents, searchQuery, selectedTags]);

  return {
    setSearchQuery,
    availableTags,
    selectedTags,
    toggleTagFilter,
    filteredDocuments,
  };
}
