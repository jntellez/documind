import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { styled } from 'nativewind';
import { View } from 'react-native';
import { cn } from '@/lib/cn';
import { useUiTheme } from '@/theme/useUiTheme';

const StyledBlurView = styled(ExpoBlurView);

const iconLibraries = {
  'ant-design': AntDesign,
  feather: Feather,
  'font-awesome': FontAwesome,
  'font-awesome-6': FontAwesome6,
  ionicons: Ionicons,
  octicons: Octicons,
} as const;

type IconLibrary = keyof typeof iconLibraries;
type IconVariant = 'default' | 'circle' | 'soft' | 'outline';
type IconTone = 'foreground' | 'muted' | 'primary' | 'destructive' | 'success' | 'warning';
type IconContainerTone = 'surface' | 'muted' | 'primary' | 'destructive' | 'transparent';
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

type IconProps = {
  library: IconLibrary;
  name: string;
  variant?: IconVariant;
  tone?: IconTone;
  containerTone?: IconContainerTone;
  size?: IconSize;
  color?: string;
  className?: string;
  containerClassName?: string;
};

const sizeMap = {
  xs: { icon: 14, container: 24 },
  sm: { icon: 16, container: 28 },
  md: { icon: 18, container: 32 },
  lg: { icon: 20, container: 36 },
  xl: { icon: 24, container: 48 },
} as const;

const variantClasses: Record<Exclude<IconVariant, 'default'>, string> = {
  circle: 'rounded-full border shadow-md overflow-hidden items-center justify-center',
  soft: 'rounded-xl border shadow-md overflow-hidden items-center justify-center',
  outline: 'rounded-full border overflow-hidden items-center justify-center',
};

const containerToneClasses: Record<IconContainerTone, string> = {
  surface: 'bg-surface-glass dark:bg-dark-surface-glass border-border dark:border-dark-border',
  muted: 'bg-muted dark:bg-dark-muted border-border dark:border-dark-border',
  primary: 'bg-primary dark:bg-dark-primary border-primary dark:border-dark-primary',
  destructive: 'bg-surface-glass dark:bg-dark-surface-glass border-destructive/20 dark:border-dark-destructive/30',
  transparent: 'bg-transparent border-transparent',
};

const toneClasses: Record<IconTone, string> = {
  foreground: 'text-foreground dark:text-dark-foreground',
  muted: 'text-muted-foreground dark:text-dark-muted-foreground',
  primary: 'text-primary dark:text-dark-primary',
  destructive: 'text-destructive dark:text-dark-destructive',
  success: 'text-success',
  warning: 'text-warning-foreground dark:text-dark-warning-foreground',
};

function resolveIconSize(size: IconSize) {
  if (typeof size === 'number') {
    return {
      icon: size,
      container: Math.max(size + 12, Math.round(size * 1.8)),
    };
  }

  return sizeMap[size];
}

export default function Icon({
  library,
  name,
  variant = 'default',
  tone = 'foreground',
  containerTone = 'surface',
  size = 'md',
  color,
  className,
  containerClassName,
}: IconProps) {
  const theme = useUiTheme();
  const IconComponent = iconLibraries[library];
  const resolvedSize = resolveIconSize(size);

  const colorByTone: Record<IconTone, string> = {
    foreground: theme.foreground,
    muted: theme.mutedForeground,
    primary: theme.primary,
    destructive: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  };

  const iconNode = (
    <IconComponent
      name={name as never}
      size={resolvedSize.icon}
      color={color ?? colorByTone[tone]}
      className={cn(toneClasses[tone], className)}
    />
  );

  if (variant === 'default') {
    return iconNode;
  }

  return (
    <View
      className={cn(variantClasses[variant], containerToneClasses[containerTone], containerClassName)}
      style={{
        width: resolvedSize.container,
        height: resolvedSize.container,
      }}
    >
      {containerTone !== 'transparent' && (
        <StyledBlurView intensity={10} tint={theme.blurTint} className="absolute inset-0" />
      )}
      {iconNode}
    </View>
  );
}
