import { Pressable, View } from "react-native";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { Paragraph } from "@/components/ui/Typography";

export function SettingsActionRow({
  icon,
  title,
  description,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Card>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between p-4 active:opacity-70"
      >
        <View className="flex-row items-center flex-1">
          <View className="size-10 rounded-full border shadow-md border-border dark:border-dark-border items-center justify-center mr-3">
            <Icon library="ionicons" name={icon} size="lg" />
          </View>
          <View className="flex-1">
            <Paragraph className="font-semibold text-foreground dark:text-dark-foreground mb-0.5">
              {title}
            </Paragraph>
            <Paragraph className="text-sm">{description}</Paragraph>
          </View>
        </View>
        <Icon library="feather" name="chevron-right" size="lg" tone="mutedForeground" />
      </Pressable>
    </Card>
  );
}
