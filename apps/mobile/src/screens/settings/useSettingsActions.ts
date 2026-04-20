import { Alert } from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { useDocumentCache } from "@/context/DocumentCacheContext";
import { showToast } from "@/components/ui/Toast";
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
    Alert.alert(
      "Clear Cache",
      "This will clear all cached documents. You will need to reload them.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearCache();
            showToast({
              type: "success",
              text1: "Cache cleared",
              text2: "All cached documents have been removed",
            });
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
