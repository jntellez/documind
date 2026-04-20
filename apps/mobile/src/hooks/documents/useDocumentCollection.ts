import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { Document } from "@documind/types";

import {
  deleteDocumentOffline,
  getDocumentsOffline,
  syncWithServer,
} from "@/services/offlineDocumentService";
import { showToast } from "@/components/ui/Toast";

type UseDocumentCollectionOptions = {
  isOnline: boolean;
};

export function useDocumentCollection({
  isOnline,
}: UseDocumentCollectionOptions) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasInitialSync, setHasInitialSync] = useState(false);

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
    [hasInitialSync, isOnline],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDocuments(false, true);
    setIsRefreshing(false);
  }, [fetchDocuments]);

  const removeDocument = useCallback(async (id: number) => {
    try {
      await deleteDocumentOffline(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      showToast({
        type: "success",
        text1: "Deleted",
        text2: "Document deleted successfully",
      });
    } catch {
      showToast({
        type: "error",
        text1: "Error",
        text2: "Failed to delete document",
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!hasInitialSync) fetchDocuments(true, false);
      else if (!isLoading) fetchDocuments(false, false);
    }, [fetchDocuments, hasInitialSync, isLoading]),
  );

  return {
    documents,
    setDocuments,
    isLoading,
    isRefreshing,
    fetchDocuments,
    handleRefresh,
    removeDocument,
  };
}
