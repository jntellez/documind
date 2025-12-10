import { View, Text, ScrollView, Keyboard } from 'react-native';
import { HomeScreenProps } from 'types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from 'nativewind';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { processUrl, pickDocument } from '@/services/documentService';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [inputValue, setInputValue] = useState<string>("");
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string>("");

  async function handleSubmit() {
    if (!isValidated) return;

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const data = await processUrl(inputValue);

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

  async function handleFilePicker() {
    setIsLoading(true);

    const file = await pickDocument();

    if (file) {
      setSelectedFile(file.name);
      setInputValue("");

      // Procesar el archivo local
      // const data = await processLocalFile(file);
      // navigation.navigate("Document", { data });
    }

    setIsLoading(false);
  }

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4 pt-6">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          <Input
            type="url"
            placeholder={selectedFile || "Enter a url"}
            className="p-5"
            defaultValue={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
              if (text.length > 0) {
                setSelectedFile("");
              }
            }}
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
              : <Button
                variant="icon-only"
                loading={isLoading}
                onPress={handleFilePicker}
                icon={<FontAwesome6 name="add" size={18} color="#666" />}
                className="w-[40px] h-[40px] absolute right-2 top-2 items-center justify-center"
              />
          }
        </View>

        <Card className="mt-6 items-center justify-center py-14">
          <Ionicons name="tablet-portrait" size={64} color="#a5a7ad" />
          <Text className="text-zinc-900 dark:text-zinc-100 text-lg">Recent documents is empty</Text>
        </Card>
      </ScrollView>
    </View>
  );
}