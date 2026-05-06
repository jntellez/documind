import { View } from "react-native";
import type { AuthUser } from "@documind/types";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { Paragraph, Title } from "@/components/ui/Typography";
import { useUiTheme } from "@/theme/useUiTheme";
import { SettingsActionRow } from "./components/SettingsActionRow";
import { SettingsSection } from "./components/SettingsSection";
export { SettingsReadingSection } from "./components/SettingsReadingSection";


export function SettingsAccountSection({
  user,
  onLogin,
}: {
  user: AuthUser | null;
  onLogin: () => void;
}) {
  if (user) {
    return (
      <View className="items-center py-4 mb-6">
        <Avatar
          src={user.avatar_url}
          fallback={user.name?.charAt(0).toUpperCase() || "U"}
          alt={user.name || "User"}
        />
        <Title className="text-xl mt-4 mb-1">{user.name || "Unknown User"}</Title>
        <Paragraph className="text-sm">{user.email || "no-email@example.com"}</Paragraph>
      </View>
    );
  }

  return (
    <View className="items-center py-8 mb-2">
      <View className="size-20 rounded-full bg-muted dark:bg-dark-muted items-center justify-center mb-4">
        <Icon library="ionicons" name="person-outline" size={40} tone="mutedForeground" />
      </View>
      <Title className="text-xl mb-2">Welcome to Documind</Title>
      <Paragraph className="text-center mb-6">Login to access all features</Paragraph>
      <Button
        onPress={onLogin}
        title="Login"
      />
    </View>
  );
}

export function SettingsAppearanceSection({
  theme,
  onToggleTheme,
}: {
  theme: ReturnType<typeof useUiTheme>;
  onToggleTheme: () => void;
}) {
  return (
    <SettingsSection title="Appearance">
      <SettingsActionRow
        icon={theme.isDark ? "moon" : "sunny"}
        title="Theme"
        description={theme.isDark ? "Dark Mode" : "Light Mode"}
        onPress={onToggleTheme}
      />
    </SettingsSection>
  );
}

export function SettingsDataSection({
  onClearCache,
}: {
  onClearCache: () => void;
}) {
  return (
    <SettingsSection title="Data & Storage">
      <SettingsActionRow
        icon="trash-outline"
        title="Clear Cache"
        description="Remove local documents when no offline sync is pending"
        onPress={onClearCache}
      />
    </SettingsSection>
  );
}

export function SettingsAboutSection() {
  return (
    <SettingsSection title="About">
      <Card>
        <View className="p-4">
          <Paragraph className="font-semibold text-foreground dark:text-dark-foreground mb-1.5">
            Documind
          </Paragraph>
          <Paragraph className="text-sm mb-1">Version 1.0.0</Paragraph>
          <Paragraph className="text-sm">© 2025 Documind. All rights reserved.</Paragraph>
        </View>
      </Card>
    </SettingsSection>
  );
}
