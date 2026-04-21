import { View, type ViewProps } from "react-native";

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
      className={`flex-1 bg-background dark:bg-dark-background p-4 pt-6 ${className}`.trim()}
      {...props}
    >
      {children}
    </View>
  );
}
