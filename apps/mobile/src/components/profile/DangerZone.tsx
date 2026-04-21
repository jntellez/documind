import { View, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from '@/components/ui/Card';
import { Paragraph } from '@/components/ui/Typography';

type DangerZoneProps = {
  onDeletePress: () => void;
};

export default function DangerZone({ onDeletePress }: DangerZoneProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="mb-10">
      <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-60">
        Danger Zone
      </Paragraph>
      <Card>
        <TouchableOpacity
          className="flex-row items-center p-4"
          onPress={onDeletePress}
        >
          <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center mr-3">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </View>
          <View className="flex-1">
            <Paragraph className="font-semibold text-red-500">Delete Account</Paragraph>
            <Paragraph className="text-xs opacity-60">Permanently delete your account and all data</Paragraph>
          </View>
          <Ionicons name="chevron-forward" size={18} color={isDark ? '#666' : '#999'} />
        </TouchableOpacity>
      </Card>
    </View>
  );
}
