import { View, ScrollView, Keyboard, ActivityIndicator } from 'react-native';
import { HomeScreenProps } from 'types';
import type { Document } from '@documind/types';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';
import { useCallback, useState } from 'react';
import { showToast } from '@/components/ui/Toast';
import { processFile, processUrl, pickDocument } from '@/services/documentService';
import { getDocumentsOffline } from '@/services/offlineDocumentService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenContainer from '@/components/ui/ScreenContainer';
import { Paragraph } from '@/components/ui/Typography';
import DocumentItem from '@/components/documents/DocumentItem';
import Card from '@/components/ui/Card';
import { useUiTheme } from '@/theme/useUiTheme';

export default function Home() {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const theme = useUiTheme();
  const [inputValue, setInputValue] = useState<string>("");
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [isLoadingRecentDocuments, setIsLoadingRecentDocuments] = useState<boolean>(true);
  const [hasLoadedRecentDocuments, setHasLoadedRecentDocuments] = useState<boolean>(false);
  const loadRecentDocuments = useCallback(async () => {
    if (!hasLoadedRecentDocuments) {
      setIsLoadingRecentDocuments(true);
    }

    try {
      const response = await getDocumentsOffline();
      const documents = [...response.documents]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);

      setRecentDocuments(documents);
    } catch (error: any) {
      showToast({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load recent documents',
      });
    } finally {
      setHasLoadedRecentDocuments(true);
      setIsLoadingRecentDocuments(false);
    }
  }, [hasLoadedRecentDocuments]);

  useFocusEffect(
    useCallback(() => {
      void loadRecentDocuments();
    }, [loadRecentDocuments]),
  );

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

    try {
      const file = await pickDocument();

      if (!file) {
        return;
      }

      setSelectedFile(file.name);
      setInputValue("");

      const data = await processFile(file);
      navigation.navigate("Document", { data });
    } catch (error: any) {
      showToast({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to process file',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1 pt-30"
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
                icon={<Icon library="feather" name="search" size="md" tone="mutedForeground" />}
                className="size-[40px] absolute right-2 top-2 items-center justify-center"
              />
              : <Button
                variant="icon-only"
                loading={isLoading}
                onPress={handleFilePicker}
                icon={<Icon library="font-awesome-6" name="add" size="md" tone="mutedForeground" />}
                className="size-[40px] absolute right-2 top-2 items-center justify-center"
              />
          }
        </View>

        <View className="mt-6">
          {isLoadingRecentDocuments ? (
            <View className="items-center justify-center py-14">
              <ActivityIndicator size="large" color={theme.mutedForeground} />
              <Paragraph className="mt-4">Loading recent documents</Paragraph>
            </View>
          ) : recentDocuments.length > 0 ? (
            <View className="gap-4">
              {recentDocuments.map((document) => (
                <DocumentItem
                  key={document.id}
                  document={document}
                  variant="compact"
                  onPress={() => navigation.navigate('Document', { data: document })}
                />
              ))}

              <Button
                title="View all"
                size="md"
                variant="icon-end"
                onPress={() => navigation.navigate('Documents')}
                icon={<Icon library="feather" name="arrow-right" size="sm" />}
                className="mt-1 w-full"
              />
            </View>
          ) : (
            <Card className="items-center justify-center py-14">
              <Icon library="ionicons" name="tablet-portrait" size={48} tone="mutedForeground" />
              <Paragraph className="text-lg">Recent documents is empty</Paragraph>
            </Card>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
