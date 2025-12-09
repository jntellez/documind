import { View, ScrollView, useWindowDimensions, Text, ActivityIndicator } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from 'types';
import { useColorScheme } from 'nativewind';
import { useHeaderHeight } from '@react-navigation/elements';
import DocumentViewer from '@/components/document/DocumentViewer';
import Button from "@/components/ui/Button";
import { saveDocument, getDocumentById } from "@/services/documentService";
import { Document as DocumentType, ProcessedDocument } from 'types/api';
import { useAuth } from '@/context/AuthContext';
import { useDocumentCache } from '@/context/DocumentCacheContext';
import Toast from 'react-native-toast-message';
import { useState, useEffect } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

type DocumentScreenProps = StackScreenProps<RootStackParamList, 'Document'>;

export default function Document({ route }: DocumentScreenProps) {
  const { data, documentId } = route.params;
  const { width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const contentWidth = width - 32;
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { getDocument, setDocument: cacheDocument } = useDocumentCache();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isSaving, setIsSaving] = useState(false);
  const [document, setDocument] = useState<DocumentType | ProcessedDocument | null>(() => {
    // Inicialización optimista: intenta cargar desde cache inmediatamente
    if (data) return data;
    if (documentId) {
      const cached = getDocument(documentId);
      if (cached) {
        return cached;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!document && !!documentId);
  const isDark = colorScheme === 'dark';

  const textColor = colorScheme === 'dark' ? 'white' : 'black';
  const borderColor = colorScheme === 'dark' ? '#52525b' : '#ddd';

  // Cargar documento si viene un ID y no está en cache inicial
  useEffect(() => {
    if (documentId && !data && !document) {
      loadDocument(documentId);
    }
  }, [documentId]);

  const loadDocument = async (id: number) => {
    setIsLoading(true);
    try {
      const doc = await getDocumentById(id);
      setDocument(doc);

      // Guardar en cache
      cacheDocument(id, doc);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load document',
        position: 'bottom',
        visibilityTime: 4000,
        bottomOffset: 40
      });
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  // Type guard para verificar si es un Document guardado
  const isSavedDocument = (doc: any): doc is DocumentType => {
    return doc && 'created_at' in doc;
  };

  async function handleSave() {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    if (!document) return;

    setIsSaving(true);

    try {
      const response = await saveDocument(document as ProcessedDocument);
      // Actualizar el documento local con el guardado
      setDocument(response.document);

      // Guardar en cache
      cacheDocument(response.document.id, response.document);

      // Actualizar la navegación para reflejar el nuevo ID
      navigation.setParams({ documentId: response.document.id, data: undefined });

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

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900">
      {document ? (
        <>
          <ScrollView
            contentContainerStyle={{
              paddingTop: headerHeight,
              paddingBottom: isSavedDocument(document) ? 0 : 80
            }}
            className="flex-1"
            minimumZoomScale={1}
            maximumZoomScale={2}
            bouncesZoom={true}
          >
            <View className="p-4">
              <DocumentViewer
                title={document.title}
                content={document.content}
                contentWidth={contentWidth}
                textColor={textColor}
                borderColor={borderColor}
                wordCount={isSavedDocument(document) ? document.word_count : undefined}
              />
            </View>
          </ScrollView>

          {!isSavedDocument(document) && (
            <View className="absolute bottom-0 left-0 right-0 px-4 pb-8">
              <Button
                onPress={handleSave}
                title="Save Document"
                loading={isSaving}
                disabled={isSaving}
              />
            </View>
          )}

          {/* Overlay de loading mientras actualiza */}
          {isLoading && (
            <View className="absolute inset-0 bg-zinc-100/50 dark:bg-zinc-900/50 items-center justify-center">
              <View className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg">
                <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
                <Text className="text-zinc-900 dark:text-white mt-4 font-medium">
                  Loading document...
                </Text>
              </View>
            </View>
          )}
        </>
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
          <Text className="text-zinc-900 dark:text-zinc-100 text-lg mt-4">
            Loading document...
          </Text>
        </View>
      )}
    </View>
  );
}