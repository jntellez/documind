import { View, ScrollView, useWindowDimensions, Text } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from 'types';
import { useColorScheme } from 'nativewind';
import { useHeaderHeight } from '@react-navigation/elements';
import DocumentViewer from '@/components/document/DocumentViewer';
import Button from "@/components/ui/Button";
import { saveDocumentOffline } from "@/services/offlineDocumentService";
import { Document as DocumentType, ProcessedDocument } from 'types/api';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';
import { useState } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

type DocumentScreenProps = StackScreenProps<RootStackParamList, 'Document'>;

export default function Document({ route }: DocumentScreenProps) {
  const { data } = route.params;
  const { width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const contentWidth = width - 32;
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isSaving, setIsSaving] = useState(false);
  const isDark = colorScheme === 'dark';

  const textColor = colorScheme === 'dark' ? 'white' : 'black';
  const borderColor = colorScheme === 'dark' ? '#52525b' : '#ddd';

  // Type guard para verificar si es un Document guardado
  const isSavedDocument = (doc: any): doc is DocumentType => {
    return doc && 'created_at' in doc;
  };

  async function handleSave() {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    if (!data) return;

    setIsSaving(true);

    try {
      await saveDocumentOffline(data as ProcessedDocument);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isOnline
          ? 'Document saved successfully'
          : 'Document saved locally and will sync when online',
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 40
      });

      navigation.navigate('Main');

    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save document',
        position: 'bottom',
        visibilityTime: 4000,
        bottomOffset: 40
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!data) {
    return (
      <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 items-center justify-center">
        <Text className="text-zinc-900 dark:text-zinc-100 text-lg">
          Document not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900">
      {/* Banner offline */}
      {!isOnline && (
        <Button title="Offline Mode" className="absolute right-4 bottom-4 z-50" />
      )}

      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: isSavedDocument(data) ? 0 : 80
        }}
        className="flex-1"
        minimumZoomScale={1}
        maximumZoomScale={2}
        bouncesZoom={true}
      >
        <View className="p-4">
          <DocumentViewer
            title={data.title}
            content={data.content}
            contentWidth={contentWidth}
            textColor={textColor}
            borderColor={borderColor}
            wordCount={isSavedDocument(data) ? data.word_count : undefined}
          />
        </View>
      </ScrollView>

      {!isSavedDocument(data) && (
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 bg-zinc-100 dark:bg-zinc-900">
          <Button
            onPress={handleSave}
            title="Save Document"
            loading={isSaving}
            disabled={isSaving}
          />
        </View>
      )}
    </View>
  );
}