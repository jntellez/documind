import { Pressable, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { AuthUser } from "@documind/types";
import type { ReactNode } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Paragraph, Title } from "@/components/ui/Typography";

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="mb-6">
      <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-60">
        {title}
      </Paragraph>
      {children}
    </View>
  );
}

function SettingsActionRow({
  icon,
  title,
  description,
  isDark,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <Card>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between p-4 active:opacity-70"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full border shadow-md border-white dark:border-white/20 items-center justify-center mr-3">
            <Ionicons name={icon} size={20} color={isDark ? "#ccc" : "#333"} />
          </View>
          <View className="flex-1">
            <Paragraph className="font-semibold text-zinc-900 dark:text-white mb-0.5">
              {title}
            </Paragraph>
            <Paragraph className="text-sm">{description}</Paragraph>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? "#71717a" : "#a1a1aa"}
        />
      </Pressable>
    </Card>
  );
}

export function SettingsAccountSection({
  user,
  isDark,
  onLogin,
}: {
  user: AuthUser | null;
  isDark: boolean;
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
      <View className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center mb-4">
        <Ionicons
          name="person-outline"
          size={40}
          color={isDark ? "#71717a" : "#a1a1aa"}
        />
      </View>
      <Title className="text-xl mb-2">Welcome to Documind</Title>
      <Paragraph className="text-center mb-6">Login to access all features</Paragraph>
      <Button
        onPress={onLogin}
        title="Login"
        icon={<Ionicons name="log-in-outline" size={20} color="#fff" />}
      />
    </View>
  );
}

export function SettingsAppearanceSection({
  isDark,
  onToggleTheme,
}: {
  isDark: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <SettingsSection title="Appearance">
      <SettingsActionRow
        icon={isDark ? "moon" : "sunny"}
        title="Theme"
        description={isDark ? "Dark Mode" : "Light Mode"}
        isDark={isDark}
        onPress={onToggleTheme}
      />
    </SettingsSection>
  );
}

export function SettingsDataSection({
  isDark,
  onClearCache,
}: {
  isDark: boolean;
  onClearCache: () => void;
}) {
  return (
    <SettingsSection title="Data & Storage">
      <SettingsActionRow
        icon="trash-outline"
        title="Clear Cache"
        description="Remove local documents when no offline sync is pending"
        isDark={isDark}
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
          <Paragraph className="font-semibold text-zinc-900 dark:text-white mb-2">
            Documind
          </Paragraph>
          <Paragraph className="text-sm mb-1">Version 1.0.0</Paragraph>
          <Paragraph className="text-sm">© 2025 Documind. All rights reserved.</Paragraph>
        </View>
      </Card>
    </SettingsSection>
  );
}
