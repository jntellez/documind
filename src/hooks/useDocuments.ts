import { useState, useCallback, useMemo } from "react";
import {
  getDocumentsOffline,
  deleteDocumentOffline,
  syncWithServer,
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
  const { isOnline } = useNetworkStatus();
  const navigation = useNavigation<DocumentsScreenProps["navigation"]>();

  const fetchDocuments = useCallback(
    async (showLoading = true, forceSync = false) => {
      if (showLoading) setIsLoading(true);

      try {
        if (isOnline && (!hasInitialSync || forceSync)) {
          console.log("🔄 Syncing with server...");
          await syncWithServer();
          setHasInitialSync(true);
        }

        const response = await getDocumentsOffline();
        console.log("📄 Documents loaded:", response.documents.length);
        setDocuments(response.documents);
      } catch (error: any) {
        console.error("❌ Error fetching documents:", error);
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
          text2: isOnline
            ? "Document deleted successfully"
            : "Document will be deleted when online",
        });
      } catch (error: any) {
        showToast({
          type: "error",
          text1: "Error",
          text2: error.message || "Failed to delete document",
        });
      }
    },
    [isOnline],
  );

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeDocument(id),
        },
      ],
    );
  };

  const handleShare = async (document: Document) => {
    try {
      await Share.share({
        message: `${document.title}\n\n${document.content}`,
        title: document.title,
      });
    } catch (error: any) {
      showToast({
        type: "error",
        text1: "Error",
        text2: "Failed to share document",
      });
    }
  };

  const handlePressDocument = (document: Document) => {
    navigation.navigate("Document", { data: document });
  };

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;

    const normalizedQuery = normalizeText(searchQuery);

    return documents.filter((doc) => {
      const normalizedTitle = normalizeText(doc.title);
      const normalizedContent = doc.content ? normalizeText(doc.content) : "";

      return (
        normalizedTitle.includes(normalizedQuery) ||
        normalizedContent.includes(normalizedQuery)
      );
    });
  }, [documents, searchQuery]);

  // Carga inicial
  useFocusEffect(
    useCallback(() => {
      if (!hasInitialSync) {
        fetchDocuments(true, false);
      } else if (!isLoading) {
        fetchDocuments(false, false);
      }
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
  };
}
