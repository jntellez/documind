import { useState, useCallback, useMemo } from "react";
import {
  getDocumentsOffline,
  deleteDocumentOffline,
  syncWithServer,
  updateDocumentTagsOffline,
} from "@/services/offlineDocumentService";
import { useNetworkStatus } from "./useNetworkStatus";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { Document } from "../../types/api";
import { showToast } from "@/components/ui/Toast";
import { normalizeText } from "@/utils/text";
import { Alert, Share } from "react-native";
import { DocumentsScreenProps } from "types";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasInitialSync, setHasInitialSync] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Estados de Etiquetas
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [selectedDocForTag, setSelectedDocForTag] = useState<Document | null>(
    null,
  );
  const [tagInput, setTagInput] = useState("");

  const { isOnline } = useNetworkStatus();
  const navigation = useNavigation<DocumentsScreenProps["navigation"]>();

  // ... (fetchDocuments, handleRefresh, removeDocument, handleDelete, handleShare, handlePressDocument se mantienen exactamente igual)
  const fetchDocuments = useCallback(
    async (showLoading = true, forceSync = false) => {
      if (showLoading) setIsLoading(true);
      try {
        if (isOnline && (!hasInitialSync || forceSync)) {
          await syncWithServer();
          setHasInitialSync(true);
        }
        const response = await getDocumentsOffline();
        setDocuments(response.documents);
      } catch (error: any) {
        showToast({
          type: "error",
          text1: "Error",
          text2: error.message || "Failed to fetch documents",
        });
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [isOnline, hasInitialSync],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDocuments(false, true);
    setIsRefreshing(false);
  }, [fetchDocuments]);

  const removeDocument = useCallback(
    async (id: number) => {
      try {
        await deleteDocumentOffline(id);
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        showToast({
          type: "success",
          text1: "Deleted",
          text2: "Document deleted successfully",
        });
      } catch (error: any) {
        showToast({
          type: "error",
          text1: "Error",
          text2: "Failed to delete document",
        });
      }
    },
    [isOnline],
  );

  const handleDelete = (id: number) => {
    Alert.alert("Delete Document", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeDocument(id),
      },
    ]);
  };

  const handleShare = async (document: Document) => {
    try {
      await Share.share({
        message: `${document.title}\n\n${document.content}`,
        title: document.title,
      });
    } catch (error: any) {
      showToast({ type: "error", text1: "Error", text2: "Failed to share" });
    }
  };

  const handlePressDocument = (document: Document) => {
    navigation.navigate("Document", { data: document });
  };

  // Lógica de Modal de Etiquetas (Se mantiene igual)
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
    } catch (error: any) {
      showToast({ type: "error", text1: "Error", text2: "Failed to save tag" });
    }
  };

  // Extraer etiquetas disponibles
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
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const filteredDocuments = useMemo(() => {
    let result = documents;

    // 1. Búsqueda
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

    // 2. Filtro por Etiquetas
    if (selectedTags.length > 0) {
      result = result.filter(
        (doc) => doc.tags && doc.tags.some((tag) => selectedTags.includes(tag)),
      );
    }

    // 3. Ordenamiento fijo (Más recientes primero)
    return result.sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [documents, searchQuery, selectedTags]);

  useFocusEffect(
    useCallback(() => {
      if (!hasInitialSync) fetchDocuments(true, false);
      else if (!isLoading) fetchDocuments(false, false);
    }, [hasInitialSync, isLoading]),
  );

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
