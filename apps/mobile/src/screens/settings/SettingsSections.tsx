import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { AuthUser } from "@documind/types";
import Avatar from "@/components/ui/Avatar";
import ActionRow from "@/components/ui/ActionRow";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import IconBadge from "@/components/ui/IconBadge";
import SectionBlock from "@/components/ui/SectionBlock";
import { Paragraph, Title } from "@/components/ui/Typography";

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
      <SectionBlock title="Account">
        <Card className="items-center py-5">
          <Avatar
            src={user.avatar_url}
            fallback={user.name?.charAt(0).toUpperCase() || "U"}
            alt={user.name || "User"}
          />
          <Title className="mt-4 text-xl">{user.name || 'Unknown User'}</Title>
          <Paragraph className="mt-1 text-sm">{user.email || 'no-email@example.com'}</Paragraph>
        </Card>
      </SectionBlock>
    );
  }

  return (
    <SectionBlock title="Account">
      <Card className="items-center py-8">
        <IconBadge size="xl" tone="muted">
          <Ionicons
            name="person-outline"
            size={40}
            color={isDark ? '#a1a1aa' : '#71717a'}
          />
        </IconBadge>
        <Title className="mt-4 text-xl">Welcome to Documind</Title>
        <Paragraph className="mb-6 mt-2 text-center">Login to access all features</Paragraph>
        <Button
          onPress={onLogin}
          title="Login"
          icon={<Ionicons name="log-in-outline" size={20} color="#fff" />}
        />
      </Card>
    </SectionBlock>
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
    <SectionBlock title="Appearance">
      <ActionRow
        title="Theme"
        description={isDark ? "Dark Mode" : "Light Mode"}
        icon={
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={20}
            color={isDark ? '#fbbf24' : '#f59e0b'}
          />
        }
        iconTone="warning"
        onPress={onToggleTheme}
      />
    </SectionBlock>
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
    <SectionBlock title="Data & Storage">
      <ActionRow
        title="Clear Cache"
        description="Remove local documents when no offline sync is pending"
        icon={
          <Ionicons
            name="trash-outline"
            size={20}
            color={isDark ? '#f87171' : '#ef4444'}
          />
        }
        iconTone="destructive"
        onPress={onClearCache}
      />
    </SectionBlock>
  );
}

export function SettingsAboutSection() {
  return (
    <SectionBlock title="About">
      <Card>
        <View className="p-4">
          <Paragraph className="mb-2 font-semibold text-foreground">
            Documind
          </Paragraph>
          <Paragraph className="text-sm mb-1">Version 1.0.0</Paragraph>
          <Paragraph className="text-sm">© 2025 Documind. All rights reserved.</Paragraph>
        </View>
      </Card>
    </SectionBlock>
  );
}
