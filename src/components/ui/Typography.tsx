import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Text } from 'react-native';
import { styled } from 'nativewind';

const StyledText = styled(Text);

export function GradientTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <MaskedView
    maskElement={
      <Text className={`text-2xl font-bold ${className}`}>
        {children}
      </Text>
    }
  >
    <LinearGradient
      colors={['#0273a4', '#30b0ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <StyledText className={`text-2xl font-bold opacity-0 ${className}`}>
        {children}
      </StyledText>
    </LinearGradient>
  </MaskedView>
}

export function Title({ children, className }: { children: React.ReactNode, className?: string }) {
  return <StyledText className={`text-2xl font-bold text-zinc-900 dark:text-zinc-100 ${className}`}>
    {children}
  </StyledText>
}

export function Paragraph({ children, className }: { children: React.ReactNode, className?: string }) {
  return <StyledText className={`text-zinc-700 dark:text-zinc-300 ${className}`}>
    {children}
  </StyledText>
}