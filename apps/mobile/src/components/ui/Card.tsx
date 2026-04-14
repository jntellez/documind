import { View } from 'react-native';
import { styled, useColorScheme } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';

const StyledBlurView = styled(ExpoBlurView);

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  const { colorScheme } = useColorScheme();

  return (
    <View
      className={`
        flex gap-4 rounded-2xl border border-white dark:border-white/20 shadow-lg overflow-hidden p-4
        ${className}
      `}
    >
      <StyledBlurView
        intensity={100}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        className="absolute inset-0"
      />
      {children}
    </View>
  );
}

