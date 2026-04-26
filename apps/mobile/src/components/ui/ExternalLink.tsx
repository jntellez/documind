import { Linking, Text, TouchableOpacity, View } from "react-native";
import { styled } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { cn } from '@/lib/cn';
import Icon from '@/components/ui/Icon';
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
      className={cn(
        'rounded-lg border bg-surface-glass dark:bg-dark-surface-glass border-border dark:border-dark-border shadow-md overflow-hidden',
        className,
      )}
    >
      <StyledBlurView
        intensity={25}
        tint={theme.blurTint}
        className="absolute inset-0"
      />
      <View className="p-4 flex-col gap-0.5">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-3">
            <Icon library="feather" name="link-2" size={22} tone="foreground" />
            <Text className="text-foreground dark:text-dark-foreground font-bold">
              {title || "Go to external link"}
            </Text>
          </View>
          <Icon library="octicons" name="link-external" size="sm" tone="foreground" />
        </View>
        <Text className="text-muted-foreground dark:text-dark-muted-foreground text-xs mt-1" numberOfLines={1}>
          {url}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
