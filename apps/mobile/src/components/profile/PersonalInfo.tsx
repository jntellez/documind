import { View } from 'react-native';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { Paragraph } from '@/components/ui/Typography';

type PersonalInfoProps = {
  name: string;
  email: string;
};

export default function PersonalInfo({ name, email }: PersonalInfoProps) {
  return (
    <View className="mb-6">
      <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-70">
        Personal Info
      </Paragraph>
      <Card>
        <View className="flex-row items-center p-4">
          <Icon library="ionicons" name="person-outline" variant="circle" size="lg" containerClassName="mr-3" />
          <View className="flex-1">
            <Paragraph className="text-xs mb-0.5">Name</Paragraph>
            <Paragraph className="font-semibold text-foreground dark:text-dark-foreground">{name}</Paragraph>
          </View>
        </View>

        <View className="flex-row items-center p-4">
          <Icon library="ionicons" name="mail-outline" variant="circle" size="lg" containerClassName="mr-3" />
          <View className="flex-1">
            <Paragraph className="text-xs mb-0.5">Email</Paragraph>
            <Paragraph className="font-semibold text-foreground dark:text-dark-foreground">{email}</Paragraph>
          </View>
        </View>
      </Card>
    </View>
  );
}
