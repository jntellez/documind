import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { styled, useColorScheme } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';

const StyledBlurView = styled(ExpoBlurView);

type ButtonProps = {
  title?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'icon' | 'icon-only';
  onPress?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
};

export default function Button({
  title,
  icon,
  variant = 'default',
  onPress,
  className,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const { colorScheme } = useColorScheme();

  const showIcon = variant === 'icon' || variant === 'icon-only';
  const showText = variant !== 'icon-only';
  const isIconOnly = variant === 'icon-only';
  const isDisabled = disabled || loading;

  const iconColor = colorScheme === 'dark' ? '#e4e4e7' : '#27272a';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        rounded-full border border-white dark:border-white/20 shadow-md overflow-hidden
        ${isDisabled ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
    >
      <StyledBlurView
        intensity={20}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        className="absolute inset-0"
      />
      <View
        className={`
          flex-row items-center justify-center
          ${isIconOnly ? "p-2" : 'px-4 py-3'}
        `}
      >
        {showIcon && (
          <View className={isIconOnly ? "" : "mr-2"}>
            {loading ? (
              <ActivityIndicator size={18} color={iconColor} />
            ) : (
              icon
            )}
          </View>
        )}
        {showText && (
          <Text className="text-zinc-800 dark:text-zinc-200 font-bold text-center">
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
