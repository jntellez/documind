import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { useUiTheme } from '@/theme/useUiTheme';

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
  const theme = useUiTheme();

  const showIcon = variant === 'icon' || variant === 'icon-only';
  const showText = variant !== 'icon-only';
  const isIconOnly = variant === 'icon-only';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
      className={`
        rounded-full border shadow-md overflow-hidden
        ${isDisabled ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
    >
      <StyledBlurView
        intensity={20}
        tint={theme.blurTint}
        className="absolute inset-0"
      />
      <View
        className={`
          flex-row items-center justify-center
          ${isIconOnly ? "p-2" : 'px-4 py-3'}
        `}
      >
        {showIcon && (
          <View className={isIconOnly ? "" : "mr-4"}>
            {loading ? (
              <ActivityIndicator size={18} color={theme.icon} />
            ) : (
              icon
            )}
          </View>
        )}
        {showText && (
          <Text className="text-foreground font-bold text-center">
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
