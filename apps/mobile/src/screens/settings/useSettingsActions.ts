import { Alert } from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { useDocumentCache } from "@/context/DocumentCacheContext";
import { showToast } from "@/components/ui/Toast";
import { clearLocalDocuments, hasPendingSyncActions } from "@/storage/database";
import { SettingsScreenProps } from "types";

export function useSettingsActions() {
  const navigation = useNavigation<SettingsScreenProps["navigation"]>();
  const { signOut } = useAuth();
  const { clearCache } = useDocumentCache();

  const handleLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      }),
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            clearCache();

            showToast({
              type: "success",
              text1: "Logged out",
              text2: "You have been successfully logged out",
            });

            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Main" }],
              }),
            );
          } catch {
            showToast({
              type: "error",
              text1: "Error",
              text2: "Failed to logout",
            });
          }
        },
      },
    ]);
  };

  const handleClearCache = () => {
    if (hasPendingSyncActions()) {
      showToast({
        type: "error",
        text1: "Can't clear cache yet",
        text2: "Finish syncing your offline changes before removing local documents.",
      });
      return;
    }

    Alert.alert(
      "Clear Cache",
      "This will remove cached documents stored on this device.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            try {
              clearLocalDocuments();
              clearCache();
              showToast({
                type: "success",
                text1: "Cache cleared",
                text2: "Local documents were removed from this device.",
              });
            } catch {
              showToast({
                type: "error",
                text1: "Error",
                text2: "Failed to clear cached documents",
              });
            }
          },
        },
      ],
    );
  };

  return {
    handleLogin,
    handleLogout,
    handleClearCache,
  };
}
