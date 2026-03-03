import { useState, useCallback } from "react";
import {
  getDocumentsOffline,
  deleteDocumentOffline,
  syncWithServer,
} from "@/services/offlineDocumentService";
import { useNetworkStatus } from "./useNetworkStatus";
import { useFocusEffect } from "@react-navigation/native";
import type { Document } from "../../types/api";
import { showToast } from "@/components/ui/Toast";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasInitialSync, setHasInitialSync] = useState(false);
  const { isOnline } = useNetworkStatus();

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
    fetchDocuments,
    handleRefresh,
    removeDocument,
  };
}
