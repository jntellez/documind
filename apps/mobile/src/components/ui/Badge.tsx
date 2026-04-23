import { Text, View, type ViewProps } from "react-native";
import { styled } from "nativewind";
import { BlurView as ExpoBlurView } from "expo-blur";
import { cn } from "@/lib/cn";
import { useUiTheme } from "@/theme/useUiTheme";

const StyledBlurView = styled(ExpoBlurView);

type BadgeVariant = "default" | "muted" | "primary" | "success" | "warning" | "destructive";
type BadgeSize = "sm" | "md";

type BadgeProps = ViewProps & {
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
};

const variantClasses: Record<BadgeVariant, { container: string; text: string }> = {
  default: {
    container: "bg-surface-glass dark:bg-dark-surface-glass border border-border dark:border-dark-border",
    text: "text-foreground dark:text-dark-foreground",
  },
  muted: {
    container: "bg-surface-glass dark:bg-dark-surface-glass border border-border dark:border-dark-border",
    text: "text-muted-foreground dark:text-dark-muted-foreground",
  },
  primary: {
    container: "bg-surface-glass dark:bg-dark-surface-glass border border-primary dark:border-dark-primary",
    text: "text-primary dark:text-dark-primary",
  },
  success: {
    container: "bg-surface-glass dark:bg-dark-surface-glass border border-success/25 dark:border-success/30",
    text: "text-success",
  },
  warning: {
    container: "bg-surface-glass dark:bg-dark-surface-glass border border-warning/25 dark:border-warning/30",
    text: "text-warning-foreground dark:text-dark-warning-foreground",
  },
  destructive: {
    container: "bg-surface-glass dark:bg-dark-surface-glass border border-destructive/20 dark:border-dark-destructive/30",
    text: "text-destructive dark:text-dark-destructive",
  },
};

const sizeClasses: Record<BadgeSize, { container: string; text: string }> = {
  sm: {
    container: "px-2 py-1 rounded-full",
    text: "text-xs",
  },
  md: {
    container: "px-3 py-1.5 rounded-full",
    text: "text-sm",
  },
};

export default function Badge({
  children,
  className = "",
  textClassName = "",
  variant = "default",
  size = "sm",
  ...props
}: BadgeProps) {
  const theme = useUiTheme();
  const selectedVariant = variantClasses[variant];
  const selectedSize = sizeClasses[size];

  return (
    <View
      className={cn(
        "self-start items-center justify-center overflow-hidden",
        selectedVariant.container,
        selectedSize.container,
        className,
      )}
      {...props}
    >
      <StyledBlurView intensity={10} tint={theme.blurTint} className="absolute inset-0" />
      <Text
        className={cn(
          "text-center font-medium",
          selectedVariant.text,
          selectedSize.text,
          textClassName,
        )}
      >
        {children}
      </Text>
    </View>
  );
}
