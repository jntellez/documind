import { TouchableOpacity, Text, View } from 'react-native';
import { styled, useColorScheme } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';
import React from 'react';

const StyledBlurView = styled(ExpoBlurView);

type ButtonProps = {
  title?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'icon' | 'icon-only';
  onPress?: () => void;
  className?: string;
};

export default function Button({
  title,
  icon,
  variant = 'default',
  onPress,
  className,
}: ButtonProps) {
  const { colorScheme } = useColorScheme();

  const showIcon = variant === 'icon' || variant === 'icon-only';
  const showText = variant !== 'icon-only';
  const isIconOnly = variant === 'icon-only';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`
        rounded-full border border-white dark:border-white/20 shadow-md overflow-hidden
        ${className}
      `}
    >
      <StyledBlurView
        intensity={100}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        className="absolute inset-0"
      />
      <View
        className={`
          items-center justify-center
          ${isIconOnly ? "p-2" : 'px-4 py-3'}
        `}
      >
        {showIcon && <View className={isIconOnly ? "" : "mr-2"}>{icon}</View>}
        {showText && (
          <Text className="text-zinc-800 dark:text-zinc-200 font-bold text-center">
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
