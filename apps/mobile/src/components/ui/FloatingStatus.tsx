import type { ReactNode } from 'react';
import { View } from 'react-native';
import { styled } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { Paragraph } from './Typography';
import { useUiTheme } from '@/theme/useUiTheme';

const StyledBlurView = styled(ExpoBlurView);

type FloatingStatusProps = {
  className?: string;
  icon?: ReactNode;
  label: string;
};

export default function FloatingStatus({ className, icon, label }: FloatingStatusProps) {
  const theme = useUiTheme();

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
      className={`absolute bottom-4 right-4 z-50 overflow-hidden rounded-full border shadow-lg ${className ?? ''}`}
    >
      <StyledBlurView intensity={40} tint={theme.blurTint} className="absolute inset-0" />
      <View className="flex-row items-center px-4 py-3">
        {icon ? <View className="mr-2">{icon}</View> : null}
        <Paragraph className="font-semibold text-foreground">{label}</Paragraph>
      </View>
    </View>
  );
}
