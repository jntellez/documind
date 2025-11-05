import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/../types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from 'nativewind';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';

type HomeScreenNavigationProp = StackScreenProps<RootStackParamList, 'Home'>;
interface HomeScreenProps extends HomeScreenNavigationProp { }

export default function Home({ navigation }: HomeScreenProps) {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4">
      <ScrollView className="flex-1">
        <View className="flex-1">
          <Input />
          <Button variant="icon-only" icon={<FontAwesome6 name="add" size={18} color="#666" />} className="w-10 h-10 absolute right-2 top-2 items-center justify-center" />
        </View>

        <Card className="mt-6 items-center justify-center py-10">
          <Ionicons name="tablet-portrait" size={64} color="#a5a7ad" />
          <Text className="text-zinc-900 dark:text-zinc-100 text-lg">Recent documents is empty</Text>
          <Button
            title="Toggle Theme"
            onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
          />
        </Card>
      </ScrollView>
    </View>
  );
}