import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";
import { tokenStorage } from "@/lib/storage";
import { showToast } from "@/components/ui/Toast";
import { useDocumentCache } from "@/context/DocumentCacheContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function useProfile() {
  const { user, signOut } = useAuth();
  const { documents } = useDocuments();
  const { clearCache } = useDocumentCache();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const name = user?.name || "Unknown User";
  const email = user?.email || "no-email@example.com";
  const initials = name.charAt(0).toUpperCase();
  const avatarUrl = user?.avatar_url;
  const documentsCount = documents.length;
  const canConfirmDelete = confirmText === "delete account";

  function openDeleteModal() {
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setConfirmText("");
  }

  async function handleDeleteAccount() {
    if (!canConfirmDelete) return;
    setIsDeleting(true);
    try {
      const token = await tokenStorage.get();
      const res = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error deleting account");
      clearCache();
      await signOut();
      showToast({
        type: "success",
        text1: "Account deleted",
        text2: "Your account has been permanently deleted.",
      });
    } catch (error) {
      showToast({ type: "error", text1: "Error", text2: String(error) });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setConfirmText("");
    }
  }

  return {
    name,
    email,
    initials,
    avatarUrl,
    documentsCount,
    showDeleteModal,
    confirmText,
    isDeleting,
    canConfirmDelete,
    setConfirmText,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteAccount,
  };
}
