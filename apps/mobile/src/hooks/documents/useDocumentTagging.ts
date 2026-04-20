import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Document } from "@documind/types";

import { showToast } from "@/components/ui/Toast";
import { updateDocumentTagsOffline } from "@/services/offlineDocumentService";

type UseDocumentTaggingOptions = {
  setDocuments: Dispatch<SetStateAction<Document[]>>;
};

export function useDocumentTagging({
  setDocuments,
}: UseDocumentTaggingOptions) {
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [selectedDocForTag, setSelectedDocForTag] = useState<Document | null>(null);
  const [tagInput, setTagInput] = useState("");

  const openTagModal = (doc: Document) => {
    setSelectedDocForTag(doc);
    setTagInput("");
    setIsTagModalVisible(true);
  };

  const closeTagModal = () => {
    setIsTagModalVisible(false);
    setSelectedDocForTag(null);
    setTagInput("");
  };

  const handleSaveTag = async () => {
    if (!selectedDocForTag || !tagInput.trim()) return;

    const newTag = tagInput.trim().toLowerCase();
    const currentTags = selectedDocForTag.tags || [];

    if (currentTags.includes(newTag)) {
      showToast({ type: "error", text1: "Error", text2: "Tag already exists" });
      return;
    }

    const updatedTags = [...currentTags, newTag];

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === selectedDocForTag.id ? { ...doc, tags: updatedTags } : doc,
      ),
    );

    closeTagModal();

    try {
      await updateDocumentTagsOffline(selectedDocForTag.id, updatedTags);
      showToast({
        type: "success",
        text1: "Success",
        text2: "Tag added successfully",
      });
    } catch {
      showToast({ type: "error", text1: "Error", text2: "Failed to save tag" });
    }
  };

  return {
    isTagModalVisible,
    tagInput,
    setTagInput,
    openTagModal,
    closeTagModal,
    handleSaveTag,
  };
}
