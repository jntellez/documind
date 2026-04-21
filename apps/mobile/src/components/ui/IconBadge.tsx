import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useUiTheme } from '@/theme/useUiTheme';

type IconBadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'muted';
type IconBadgeSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<IconBadgeSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export default function IconBadge({
  children,
  className,
  size = 'md',
  tone = 'default',
}: {
  children: ReactNode;
  className?: string;
  size?: IconBadgeSize;
  tone?: IconBadgeTone;
}) {
  const theme = useUiTheme();

  const palette = {
    default: {
      backgroundColor: theme.surfaceMuted,
      borderColor: theme.border,
    },
    muted: {
      backgroundColor: theme.backgroundMuted,
      borderColor: theme.borderMuted,
    },
    primary: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    success: {
      backgroundColor: `${theme.success}22`,
      borderColor: `${theme.success}33`,
    },
    warning: {
      backgroundColor: `${theme.warning}22`,
      borderColor: `${theme.warning}33`,
    },
    destructive: {
      backgroundColor: `${theme.destructive}22`,
      borderColor: `${theme.destructive}33`,
    },
  }[tone];

  return (
    <View
      style={palette}
      className={`items-center justify-center rounded-full border ${sizeClasses[size]} ${className ?? ''}`}
    >
      {children}
    </View>
  );
}
