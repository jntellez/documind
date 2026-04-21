import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useUiTheme } from '@/theme/useUiTheme';

type TagChipProps = {
  accessory?: ReactNode;
  className?: string;
  label: string;
  onPress?: () => void;
  selected?: boolean;
};

export default function TagChip({ accessory, className, label, onPress, selected = false }: TagChipProps) {
  const theme = useUiTheme();
  const Container = onPress ? Pressable : View;

  return (
    <Container
      {...(onPress ? { onPress } : {})}
      style={{
        backgroundColor: selected ? theme.primary : theme.surface,
        borderColor: selected ? theme.primary : theme.border,
      }}
      className={`rounded-full border px-3.5 py-2 ${onPress ? 'active:opacity-80' : ''} ${className ?? ''}`}
    >
      <View className="flex-row items-center">
        <Text
          style={{ color: selected ? theme.primaryForeground : theme.icon }}
          className="text-sm font-medium"
        >
          {label}
        </Text>
        {accessory ? <View className="ml-1.5">{accessory}</View> : null}
      </View>
    </Container>
  );
}
