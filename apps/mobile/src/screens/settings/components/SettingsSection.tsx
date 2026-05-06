import { View } from "react-native";
import type { ReactNode } from "react";
import { Paragraph } from "@/components/ui/Typography";

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="mb-6">
      <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-70">
        {title}
      </Paragraph>
      {children}
    </View>
  );
}
