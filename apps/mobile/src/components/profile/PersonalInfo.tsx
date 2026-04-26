import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from '@/components/ui/Card';
import { Paragraph } from '@/components/ui/Typography';
import { useUiTheme } from '@/theme/useUiTheme';

type PersonalInfoProps = {
  name: string;
  email: string;
};

export default function PersonalInfo({ name, email }: PersonalInfoProps) {
  const theme = useUiTheme();

  return (
    <View className="mb-6">
      <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-70">
        Personal Info
      </Paragraph>
      <Card>
        <View className="flex-row items-center p-4">
          <View className="size-10 rounded-full border shadow-md border-border dark:border-dark-border items-center justify-center mr-3">
            <Ionicons name="person-outline" size={20} color={theme.foreground} />
          </View>
          <View className="flex-1">
            <Paragraph className="text-xs mb-0.5">Name</Paragraph>
            <Paragraph className="font-semibold text-foreground dark:text-dark-foreground">{name}</Paragraph>
          </View>
        </View>

        <View className="flex-row items-center p-4">
          <View className="size-10 rounded-full border shadow-md border-border dark:border-dark-border items-center justify-center mr-3">
            <Ionicons name="mail-outline" size={20} color={theme.foreground} />
          </View>
          <View className="flex-1">
            <Paragraph className="text-xs mb-0.5">Email</Paragraph>
            <Paragraph className="font-semibold text-foreground dark:text-dark-foreground">{email}</Paragraph>
          </View>
        </View>
      </Card>
    </View>
  );
}
