import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { cn } from '@/lib/cn';
import { useUiTheme } from '@/theme/useUiTheme';

const StyledBlurView = styled(ExpoBlurView);

type ButtonProps = {
  title?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'icon' | 'icon-end' | 'icon-only';
  tone?: 'default' | 'primary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  loading?: boolean;
};

const toneClasses = {
  default: {
    container: 'bg-surface dark:bg-dark-surface border-border dark:border-dark-border',
    text: 'text-foreground dark:text-dark-foreground',
    iconClassName: undefined,
    iconColor: undefined,
  },
  primary: {
    container: 'bg-primary dark:bg-dark-primary border-primary dark:border-dark-primary',
    text: 'text-primary-foreground dark:text-dark-primary-foreground',
    iconClassName: 'text-primary-foreground dark:text-dark-primary-foreground',
    iconColor: themeColor('primary'),
  },
  destructive: {
    container: 'bg-surface dark:bg-dark-surface border-destructive dark:border-dark-destructive',
    text: 'text-destructive dark:text-dark-destructive',
    iconClassName: 'text-destructive dark:text-dark-destructive',
    iconColor: themeColor('destructive'),
  },
} as const;

const sizeClasses = {
  sm: {
    container: 'px-3 py-1',
    iconOnly: 'p-2',
    text: 'text-sm',
    gap: 'gap-2',
  },
  md: {
    container: 'px-4 py-2',
    iconOnly: 'p-2.5',
    text: 'text-base',
    gap: 'gap-3',
  },
  lg: {
    container: 'px-5 py-3',
    iconOnly: 'p-3',
    text: 'text-lg',
    gap: 'gap-3.5',
  },
} as const;

function themeColor(tone: 'primary' | 'destructive') {
  return tone === 'primary' ? '#f5f7ff' : '#ef4444';
}

export default function Button({
  title,
  icon,
  variant = 'default',
  tone = 'default',
  size = 'md',
  onPress,
  className,
  textClassName,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const theme = useUiTheme();

  const showIcon = variant === 'icon' || variant === 'icon-end' || variant === 'icon-only';
  const showText = variant !== 'icon-only';
  const isIconOnly = variant === 'icon-only';
  const isIconEnd = variant === 'icon-end';
  const isDisabled = disabled || loading;
  const selectedTone = toneClasses[tone];
  const selectedSize = sizeClasses[size];

  const renderedIcon = React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<{ className?: string; color?: string }>, {
      className: cn((icon as React.ReactElement<{ className?: string; color?: string }>).props.className, selectedTone.iconClassName),
      color:
        selectedTone.iconColor ??
        (icon as React.ReactElement<{ className?: string; color?: string }>).props.color,
    })
    : icon;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        'rounded-full border shadow-md overflow-hidden',
        selectedTone.container,
        isDisabled ? 'opacity-50' : 'opacity-100',
        className,
      )}
    >
      <StyledBlurView
        intensity={20}
        tint={theme.blurTint}
        className="absolute inset-0"
      />
      <View
        className={cn(
          'flex-row items-center justify-center',
          selectedSize.gap,
          isIconOnly ? selectedSize.iconOnly : selectedSize.container,
        )}
      >
        {showIcon && !isIconEnd && (
          <View>
            {loading ? (
              <ActivityIndicator
                size={18}
                color={
                  tone === 'default'
                    ? theme.mutedForeground
                    : tone === 'primary'
                      ? theme.primaryForeground
                      : '#ef4444'
                }
              />
            ) : (
              renderedIcon
            )}
          </View>
        )}
        {showText && (
          <Text className={cn('font-bold text-center', selectedSize.text, selectedTone.text, textClassName)}>
            {title}
          </Text>
        )}
        {showIcon && isIconEnd && (
          <View>
            {loading ? (
              <ActivityIndicator
                size={18}
                color={
                  tone === 'default'
                    ? theme.foreground
                    : tone === 'primary'
                      ? theme.primaryForeground
                      : '#ef4444'
                }
              />
            ) : (
              renderedIcon
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
