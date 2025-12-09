import { View, FlatList, RefreshControl, Alert, Share, ActivityIndicator } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DocumentsScreenProps } from 'types';
import { Document } from 'types/api';
import { getDocuments, deleteDocument } from '@/services/documentService';
import DocumentItem from '@/components/documents/DocumentItem';
import EmptyState from '@/components/documents/EmptyState';
import Toast from 'react-native-toast-message';
import { useColorScheme } from 'nativewind';

export default function Documents() {
  const navigation = useNavigation<DocumentsScreenProps['navigation']>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const fetchDocuments = async (showLoading = true, force = false) => {
    // Si ya cargó una vez y no es forzado, no hacer nada
    if (hasLoadedOnce && !force) return;

    if (showLoading) setIsLoading(true);

    try {
      const response = await getDocuments();
      setDocuments(response.documents);
      setHasLoadedOnce(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch documents',
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 40,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDocuments(false, true); // Force reload
    setIsRefreshing(false);
  };

  const handleDocumentPress = (document: Document) => {
    navigation.navigate('Document', { documentId: document.id });
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(id);
              setDocuments((prev) => prev.filter((doc) => doc.id !== id));

              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Document deleted successfully',
                position: 'bottom',
                visibilityTime: 2000,
                bottomOffset: 40,
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete document',
                position: 'bottom',
                visibilityTime: 4000,
                bottomOffset: 40,
              });
            }
          },
        },
      ]
    );
  };

  const handleShare = async (document: Document) => {
    try {
      await Share.share({
        message: `Check out this document: ${document.title}\n${document.original_url || ''}`,
        title: document.title,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to share document',
        position: 'bottom',
        visibilityTime: 3000,
        bottomOffset: 40,
      });
    }
  };

  const handleAddTag = (document: Document) => {
    // TODO: Implementar funcionalidad de tag
  };

  // Solo cargar al montar el componente por primera vez
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Recargar cuando vuelve el foco solo si se guardó un nuevo documento
  useFocusEffect(
    useCallback(() => {
      // Solo recargar si ya había cargado antes (significa que volvió de otra pantalla)
      if (hasLoadedOnce) {
        fetchDocuments(false, true);
      }
    }, [hasLoadedOnce])
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 items-center justify-center">
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4 pt-6">
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DocumentItem
            document={item}
            onPress={handleDocumentPress}
            onDelete={handleDelete}
            onShare={handleShare}
            onAddTag={handleAddTag}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#fff' : '#000'}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, gap: 16 }}
      />
    </View>
  );
}