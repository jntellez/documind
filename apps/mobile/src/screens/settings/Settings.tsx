import Ionicons from "@expo/vector-icons/Ionicons";
import { useColorScheme } from "nativewind";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import {
  SettingsAboutSection,
  SettingsAccountSection,
  SettingsAppearanceSection,
  SettingsDataSection,
} from "./SettingsSections";
import { useSettingsActions } from "./useSettingsActions";

export default function Settings() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { user } = useAuth();
  const { handleLogin, handleLogout, handleClearCache } = useSettingsActions();
  const isDark = colorScheme === "dark";

  return (
    <Screen scroll contentClassName="p-4 pt-6">
        <SettingsAccountSection user={user} isDark={isDark} onLogin={handleLogin} />
        <SettingsAppearanceSection
          isDark={isDark}
          onToggleTheme={toggleColorScheme}
        />
        {user && (
          <SettingsDataSection
            isDark={isDark}
            onClearCache={handleClearCache}
          />
        )}
        <SettingsAboutSection />

        {user && (
          <Button
            onPress={handleLogout}
            title="Logout"
            variant="icon"
            icon={<Ionicons name="log-out-outline" size={20} color="#ef4444" />}
            className="text-red-500"
          />
        )}
    </Screen>
  );
}
