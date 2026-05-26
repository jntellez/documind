import { CommonActions, useNavigation } from '@react-navigation/native';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { Paragraph, Title } from '@/components/ui/Typography';

type AuthRequiredStateProps = {
  title: string;
  description: string;
};

export default function AuthRequiredState({
  title,
  description,
}: AuthRequiredStateProps) {
  const navigation = useNavigation();

  return (
    <Card className="items-center justify-center py-10 px-6 gap-4">
      <Icon library="octicons" name="lock" size="xl" tone="mutedForeground" />
      <Title className="text-xl text-center">{title}</Title>
      <Paragraph className="text-center opacity-80">{description}</Paragraph>
      <Button
        title="Log in"
        onPress={() =>
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' as never }],
            }),
          )
        }
      />
    </Card>
  );
}
