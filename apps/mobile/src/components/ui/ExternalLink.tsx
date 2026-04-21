import { Linking, Text, TouchableOpacity, View } from "react-native";
import Octicons from '@expo/vector-icons/Octicons';
import Feather from '@expo/vector-icons/Feather';
import { styled } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { useUiTheme } from '@/theme/useUiTheme';

const StyledBlurView = styled(ExpoBlurView);

interface ExternalLinkProps {
  url: string;
  title?: string;
  className?: string;
}

export default function ExternalLink({ url, title, className }: ExternalLinkProps) {
  const theme = useUiTheme();

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(url)}
      className={`rounded-lg border bg-surface dark:bg-dark-surface border-border dark:border-dark-border shadow-md overflow-hidden ${className || ""}`}
    >
      <StyledBlurView
        intensity={100}
        tint={theme.blurTint}
        className="absolute inset-0"
      />
      <View className="p-4 flex-col gap-0.5">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-3">
            <Feather name="link-2" size={22} color={theme.icon} />
            <Text className="text-foreground dark:text-dark-foreground font-bold">
              {title || "Go to external link"}
            </Text>
          </View>
          <Octicons name="link-external" size={16} color={theme.icon} />
        </View>
        <Text className="text-muted-foreground dark:text-dark-muted-foreground text-xs mt-1" numberOfLines={1}>
          {url}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
