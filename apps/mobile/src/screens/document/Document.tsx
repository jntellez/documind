import { View, ScrollView, useWindowDimensions } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from 'types';
import { useHeaderHeight } from '@react-navigation/elements';
import DocumentViewer from '@/components/document/DocumentViewer';
import Button from "@/components/ui/Button";
import { saveDocumentOffline } from "@/services/offlineDocumentService";
import { Document as DocumentType, ProcessedDocument } from 'types/api';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { showToast } from "@/components/ui/Toast";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Badge from "@/components/ui/Badge";
import { Paragraph } from "@/components/ui/Typography";

type DocumentScreenProps = StackScreenProps<RootStackParamList, 'Document'>;

export default function Document({ route }: DocumentScreenProps) {
  const { data } = route.params;
  const { width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const contentWidth = width - 32;
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isSaving, setIsSaving] = useState(false);

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

      showToast({
        type: 'success',
        text1: 'Success',
        text2: isOnline
          ? 'Document saved successfully'
          : 'Document saved locally and will sync when online'
      });

      navigation.navigate('Main');

    } catch (error: any) {
      showToast({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save document'
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!data) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Paragraph className="text-lg">
          Document not found
        </Paragraph>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      {/* Banner offline */}
      {!isOnline && (
        <Badge
          size="md"
          className={`absolute shadow-md right-4 z-50 ${isSavedDocument(data) ? "bottom-12" : "bottom-22"}`}
          textClassName="font-bold"
        >
          Offline Mode
        </Badge>
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
            wordCount={isSavedDocument(data) ? data.word_count : undefined}
          />
        </View>
      </ScrollView>

      {!isSavedDocument(data) && (
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 transparent">
          <Button
            onPress={handleSave}
            title="Save Document"
            loading={isSaving}
            disabled={isSaving}
          />
        </View>
      )}
    </ScreenContainer>
  );
}
