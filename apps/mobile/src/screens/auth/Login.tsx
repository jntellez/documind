import { View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from 'types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { GradientTitle, Paragraph } from '@/components/ui/Typography';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { useAuthProviders } from '@/hooks/useAuthProviders';
import { useUiTheme } from '@/theme/useUiTheme';
import ScreenContainer from '@/components/ui/ScreenContainer';

WebBrowser.maybeCompleteAuthSession();

type Props = StackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
  const theme = useUiTheme();

  const auth = useAuthProviders(() => {
    navigation.replace('Main');
  });

  return (
    <ScreenContainer className="justify-center">
      <Card className="items-center p-6">
        <View className="size-32 items-center justify-center rounded-full mb-6 bg-muted dark:bg-dark-muted">
          <Ionicons name="tablet-portrait" size={54} color={theme.mutedForeground} />
        </View>

        <GradientTitle className="text-4xl font-medium text-center">
          Log in to Documind
        </GradientTitle>

        <Paragraph className="mb-6 text-center">
          Log in with your preferred provider:
        </Paragraph>

        <Button
          variant="icon"
          icon={<AntDesign name="google" size={20} />}
          disabled={!auth.google.request || auth.isAnyLoading}
          loading={auth.google.isLoading}
          onPress={auth.google.prompt}
          title="Continue with Google"
        />
        <Button
          variant="icon"
          icon={<FontAwesome name="github" size={20} />}
          disabled={!auth.github.request || auth.isAnyLoading}
          loading={auth.github.isLoading}
          onPress={auth.github.prompt}
          title="Continue with GitHub"
        />
      </Card>
    </ScreenContainer>
  );
}
