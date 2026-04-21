import { Keyboard } from 'react-native';
import { HomeScreenProps } from 'types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { showToast } from '@/components/ui/Toast';
import { processUrl, pickDocument } from '@/services/documentService';
import { useNavigation } from '@react-navigation/native';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import InputActionField from '@/components/ui/InputActionField';
import Screen from '@/components/ui/Screen';
import SectionBlock from '@/components/ui/SectionBlock';
import { useUiTheme } from '@/theme/useUiTheme';

export default function Home() {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const theme = useUiTheme();
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
      showToast({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to process URL',
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
    <Screen scroll contentClassName="p-4 pt-6" keyboardShouldPersistTaps="handled">
      <SectionBlock
        title="New document"
        description="Paste a link or import a file to turn long content into a focused reading view."
      >
        <InputActionField
          type="url"
          placeholder={selectedFile || 'Enter a url'}
          className="p-5"
          defaultValue={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            if (text.length > 0) {
              setSelectedFile('');
            }
          }}
          onValidationChange={(nextIsValidated) => setIsValidated(nextIsValidated)}
          action={
            inputValue.length > 0 ? (
              <Button
                variant="icon-only"
                disabled={!isValidated}
                loading={isLoading}
                onPress={handleSubmit}
                icon={<Feather name="search" size={18} color={theme.iconMuted} />}
                className="h-10 w-10 items-center justify-center"
              />
            ) : (
              <Button
                variant="icon-only"
                loading={isLoading}
                onPress={handleFilePicker}
                icon={<FontAwesome6 name="add" size={18} color={theme.iconMuted} />}
                className="h-10 w-10 items-center justify-center"
              />
            )
          }
        />
      </SectionBlock>

      <SectionBlock title="Recent documents">
        <EmptyStateCard
          className="py-14"
          icon={<Ionicons name="tablet-portrait" size={32} color={theme.iconSubtle} />}
          title="Recent documents is empty"
          description="Processed documents will appear here once you open a link or import a file."
        />
      </SectionBlock>
    </Screen>
  );
}
