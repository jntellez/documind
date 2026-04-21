import type { ReactNode } from 'react';
import type { ScrollViewProps } from 'react-native';
import { ScrollView, View } from 'react-native';
import { useUiTheme } from '@/theme/useUiTheme';

type ScreenProps = Pick<
  ScrollViewProps,
  'contentContainerStyle' | 'keyboardShouldPersistTaps' | 'refreshControl' | 'showsVerticalScrollIndicator'
> & {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  scroll?: boolean;
};

export default function Screen({
  children,
  className,
  contentClassName,
  scroll = false,
  contentContainerStyle,
  keyboardShouldPersistTaps,
  refreshControl,
  showsVerticalScrollIndicator = false,
}: ScreenProps) {
  const theme = useUiTheme();

  return (
    <View style={{ backgroundColor: theme.background }} className={`flex-1 ${className ?? ''}`}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          <View className={contentClassName}>{children}</View>
        </ScrollView>
      ) : (
        <View className={`flex-1 ${contentClassName ?? ''}`}>{children}</View>
      )}
    </View>
  );
}
