import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/cn";

type ScreenContainerProps = ViewProps & {
  children: React.ReactNode;
  className?: string;
};

export default function ScreenContainer({
  children,
  className = "",
  ...props
}: ScreenContainerProps) {
  return (
    <View
      className={cn('flex-1 bg-background dark:bg-dark-background p-4 pb-0', className)}
      {...props}
    >
      {children}
    </View>
  );
}
