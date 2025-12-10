import { View, FlatList, RefreshControl, Alert, Share, ActivityIndicator } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { DocumentsScreenProps } from 'types';
import { useColorScheme } from 'nativewind';
import DocumentItem from '@/components/documents/DocumentItem';
import EmptyState from '@/components/documents/EmptyState';
import Toast from 'react-native-toast-message';
import { Document } from 'types/api';
import {
  getDocumentsOffline,
  deleteDocumentOffline,
  syncWithServer
} from '@/services/offlineDocumentService';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Text } from 'react-native';
import Button from '@/components/ui/Button';

export default function Documents() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<DocumentsScreenProps['navigation']>();
  const { isOnline } = useNetworkStatus();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasInitialSync, setHasInitialSync] = useState(false);

  const fetchDocuments = async (showLoading = true, forceSync = false) => {
    if (showLoading) setIsLoading(true);

    try {
      // Si hay conexión y es la primera vez O es un force sync, sincronizar primero
      if (isOnline && (!hasInitialSync || forceSync)) {
        console.log('🔄 Syncing with server...');
        await syncWithServer();
        setHasInitialSync(true);
      }

      const response = await getDocumentsOffline();
      console.log('📄 Documents loaded:', response.documents.length);
      setDocuments(response.documents);
    } catch (error: any) {
      console.error('❌ Error fetching documents:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch documents',
        position: 'bottom',
        visibilityTime: 3000,
        bottomOffset: 40,
      });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDocuments(false, true);
    setIsRefreshing(false);
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
              await deleteDocumentOffline(id);

              setDocuments((prev) => prev.filter((doc) => doc.id !== id));

              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: isOnline
                  ? 'Document deleted successfully'
                  : 'Document will be deleted when online',
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
                visibilityTime: 3000,
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
        message: `${document.title}\n\n${document.content}`,
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

  const handlePress = (document: Document) => {
    // Pasar el documento completo en lugar de solo el ID
    navigation.navigate('Document', { data: document });
  };

  useEffect(() => {
    fetchDocuments(true, false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isLoading && hasInitialSync) {
        fetchDocuments(false, false);
      }
    }, [hasInitialSync, isLoading])
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 items-center justify-center">
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text className="text-zinc-600 dark:text-zinc-400 mt-4">
          {isOnline ? 'Syncing documents...' : 'Loading documents...'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4 pt-6">
      {/* Indicador de estado offline */}
      {!isOnline && (
        <Button title="Offline Mode" className="absolute right-4 bottom-4 z-50" />
      )}

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DocumentItem
            document={item}
            onPress={() => handlePress(item)}
            onDelete={() => handleDelete(item.id)}
            onShare={() => handleShare(item)}
          />
        )}
        contentContainerStyle={{
          flexGrow: 1,
          gap: 16,
        }}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#fff' : '#000'}
          />
        }
      />
    </View>
  );
}