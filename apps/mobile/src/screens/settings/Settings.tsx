import { ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useUiTheme } from "@/theme/useUiTheme";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import {
  SettingsAboutSection,
  SettingsAccountSection,
  SettingsAppearanceSection,
  SettingsDataSection,
} from "./SettingsSections";
import { useSettingsActions } from "./useSettingsActions";
import ScreenContainer from "@/components/ui/ScreenContainer";

export default function Settings() {
  const { toggleColorScheme } = useColorScheme();
  const theme = useUiTheme();
  const { user } = useAuth();
  const { handleLogin, handleLogout, handleClearCache } = useSettingsActions();

  return (
    <ScreenContainer className="pt-6">
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <SettingsAccountSection user={user} onLogin={handleLogin} />
        <SettingsAppearanceSection
          theme={theme}
          onToggleTheme={toggleColorScheme}
        />
        {user && (
          <SettingsDataSection
            onClearCache={handleClearCache}
          />
        )}
        <SettingsAboutSection />

        {user && (
          <Button
            onPress={handleLogout}
            title="Logout"
            variant="icon"
            icon={<Icon library="ionicons" name="log-out-outline" size="lg" />}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
