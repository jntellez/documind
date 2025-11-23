import { View, Text, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from 'types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from 'nativewind';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { processUrl } from '@/services/documentService';

type HomeScreenNavigationProp = StackScreenProps<RootStackParamList, 'Main'>;
interface HomeScreenProps extends HomeScreenNavigationProp { }

export default function Home({ navigation }: HomeScreenProps) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [inputValue, setInputValue] = useState<string>("");
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit() {
    if (!isValidated) return;

    setIsLoading(true);

    try {
      const data = await processUrl(inputValue);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: "Document processed successfully",
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 40
      });

      navigation.navigate("Document", { data });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to process URL',
        position: 'bottom',
        visibilityTime: 4000,
        bottomOffset: 40
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4 pt-6">
      <ScrollView className="flex-1">
        <View className="flex-1">
          <Input
            type="url"
            placeholder="Enter a url"
            className="p-5"
            defaultValue={inputValue}
            onChangeText={(text) => setInputValue(text)}
            onValidationChange={(isValidated) => setIsValidated(isValidated)}
          />
          {
            inputValue.length > 0
              ? <Button
                variant="icon-only"
                disabled={!isValidated}
                loading={isLoading}
                onPress={handleSubmit}
                icon={<Feather name="search" size={18} color="#666" />}
                className="w-[40px] h-[40px] absolute right-2 top-2 items-center justify-center"
              />
              : <Button variant="icon-only" icon={<FontAwesome6 name="add" size={18} color="#666" />} className="w-[40px] h-[40px] absolute right-2 top-2 items-center justify-center" />
          }
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