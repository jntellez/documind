import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Text } from 'react-native';

export function GradientTitle({ title }: { title: string }) {
  return <MaskedView
    maskElement={
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        {title}
      </Text>
    }
  >
    <LinearGradient
      colors={['#0273a4', '#30b0ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold', opacity: 0 }}>
        {title}
      </Text>
    </LinearGradient>
  </MaskedView>
}