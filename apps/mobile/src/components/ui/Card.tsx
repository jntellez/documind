import { View } from 'react-native';
import { styled } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { useUiTheme } from '@/theme/useUiTheme';

const StyledBlurView = styled(ExpoBlurView);

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  const theme = useUiTheme();

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
      className={`
        flex gap-4 rounded-lg border shadow-lg overflow-hidden p-4
        ${className}
      `}
    >
      <StyledBlurView
        intensity={100}
        tint={theme.blurTint}
        className="absolute inset-0"
      />
      {children}
    </View>
  );
}
