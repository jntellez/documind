import { useDocumentActions } from "./documents/useDocumentActions";
import { useDocumentCollection } from "./documents/useDocumentCollection";
import { useDocumentFilters } from "./documents/useDocumentFilters";
import { useDocumentTagging } from "./documents/useDocumentTagging";
import { useNetworkStatus } from "./useNetworkStatus";

export function useDocuments() {
  const { isOnline } = useNetworkStatus();
  const {
    documents,
    setDocuments,
    isLoading,
    isRefreshing,
    fetchDocuments,
    handleRefresh,
    removeDocument,
  } = useDocumentCollection({ isOnline });
  const {
    setSearchQuery,
    availableTags,
    selectedTags,
    toggleTagFilter,
    filteredDocuments,
  } = useDocumentFilters({ documents });
  const {
    isTagModalVisible,
    tagInput,
    setTagInput,
    openTagModal,
    closeTagModal,
    handleSaveTag,
  } = useDocumentTagging({ setDocuments });
  const { handleDelete, handleShare, handlePressDocument } = useDocumentActions({
    removeDocument,
  });

  return {
    documents,
    isLoading,
    isRefreshing,
    isOnline,
    filteredDocuments,
    fetchDocuments,
    handleRefresh,
    handleDelete,
    handleShare,
    handlePressDocument,
    removeDocument,
    setSearchQuery,

    // Props de Etiquetas
    availableTags,
    selectedTags,
    toggleTagFilter,
    isTagModalVisible,
    tagInput,
    setTagInput,
    openTagModal,
    closeTagModal,
    handleSaveTag,
  };
}
