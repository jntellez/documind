import { Alert, Share } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { Document } from "@documind/types";

import { showToast } from "@/components/ui/Toast";
import { DocumentsScreenProps } from "types";

type UseDocumentActionsOptions = {
  removeDocument: (id: number) => Promise<void>;
};

export function useDocumentActions({
  removeDocument,
}: UseDocumentActionsOptions) {
  const navigation = useNavigation<DocumentsScreenProps["navigation"]>();

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
    } catch {
      showToast({ type: "error", text1: "Error", text2: "Failed to share" });
    }
  };

  const handlePressDocument = (document: Document) => {
    navigation.navigate("Document", { data: document });
  };

  return {
    handleDelete,
    handleShare,
    handlePressDocument,
  };
}
