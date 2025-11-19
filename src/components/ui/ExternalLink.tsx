import { Linking, Text, TouchableOpacity, View } from "react-native";
import Octicons from '@expo/vector-icons/Octicons';
import Feather from '@expo/vector-icons/Feather';
import { styled, useColorScheme } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';

const StyledBlurView = styled(ExpoBlurView);

interface ExternalLinkProps {
  url: string;
  title?: string;
  className?: string;
}

export default function ExternalLink({ url, title, className }: ExternalLinkProps) {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(url)}
      className={`rounded-lg border border-white dark:border-white/20 shadow-md overflow-hidden ${className || ""}`}
    >
      <StyledBlurView
        intensity={100}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        className="absolute inset-0"
      />
      <View className="p-4 flex-col gap-0.5">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-3">
            <Feather name="link-2" size={22} color={iconColor} />
            <Text className="text-black dark:text-white font-bold">
              {title || "Go to external link"}
            </Text>
          </View>
          <Octicons name="link-external" size={16} color={iconColor} />
        </View>
        <Text className="text-zinc-500 dark:text-zinc-400 text-xs mt-1" numberOfLines={1}>
          {url}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
