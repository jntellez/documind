import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Document } from "@documind/types";

import { showToast } from "@/components/ui/Toast";
import { updateDocumentTagsOffline } from "@/services/offlineDocumentService";
import type { OfflineDocument } from "@/services/offlineDocuments/repository";
import { canAddDocumentTag, MAX_DOCUMENT_TAGS } from "./tagLimits";

type UseDocumentTaggingOptions = {
  setDocuments: Dispatch<SetStateAction<OfflineDocument[]>>;
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

    if (!canAddDocumentTag(currentTags)) {
      showToast({
        type: "error",
        text1: "Error",
        text2: `Maximum ${MAX_DOCUMENT_TAGS} tags allowed`,
      });
      return;
    }

    const updatedTags = [...currentTags, newTag];

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === selectedDocForTag.id
          ? { ...doc, tags: updatedTags, syncStatus: "pending", syncError: null }
          : doc,
      ),
    );

    closeTagModal();

    try {
      const syncResult = await updateDocumentTagsOffline(selectedDocForTag.id, updatedTags);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDocForTag.id
            ? {
                ...doc,
                syncStatus: syncResult.syncStatus,
                syncError: syncResult.syncError,
              }
            : doc,
        ),
      );
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
