import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from '@/components/ui/Card';
import { Paragraph } from '@/components/ui/Typography';

type PersonalInfoProps = {
  name: string;
  email: string;
};

export default function PersonalInfo({ name, email }: PersonalInfoProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="mb-6">
      <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-60">
        Personal Info
      </Paragraph>
      <Card>
        <View className="flex-row items-center p-4">
          <View className="w-10 h-10 rounded-full shadow-md border border-white dark:border-white/20 items-center justify-center mr-3">
            <Ionicons name="person-outline" size={20} color={isDark ? '#ccc' : '#333'} />
          </View>
          <View className="flex-1">
            <Paragraph className="text-xs opacity-60">Name</Paragraph>
            <Paragraph className="font-semibold text-zinc-900 dark:text-white">{name}</Paragraph>
          </View>
        </View>

        <View className="flex-row items-center p-4 border-t border-zinc-200/50 dark:border-zinc-700/50">
          <View className="w-10 h-10 rounded-full shadow-md border border-white dark:border-white/20 items-center justify-center mr-3">
            <Ionicons name="mail-outline" size={20} color={isDark ? '#ccc' : '#333'} />
          </View>
          <View className="flex-1">
            <Paragraph className="text-xs opacity-60">Email</Paragraph>
            <Paragraph className="font-semibold text-zinc-900 dark:text-white">{email}</Paragraph>
          </View>
        </View>
      </Card>
    </View>
  );
}
