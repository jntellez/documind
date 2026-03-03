import { View, FlatList, RefreshControl, Alert, Share, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DocumentsScreenProps } from 'types';
import { useColorScheme } from 'nativewind';
import DocumentItem from '@/components/documents/DocumentItem';
import EmptyState from '@/components/documents/EmptyState';
import { Document } from 'types/api';
import { useDocuments } from '@/hooks/useDocuments';
import { Text } from 'react-native';
import Button from '@/components/ui/Button';
import { showToast } from '@/components/ui/Toast';

export default function Documents() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<DocumentsScreenProps['navigation']>();

  const {
    documents,
    isLoading,
    isRefreshing,
    isOnline,
    handleRefresh,
    removeDocument,
  } = useDocuments();

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeDocument(id),
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
      showToast({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to share document'
      });
    }
  };

  const handlePress = (document: Document) => {
    navigation.navigate('Document', { data: document });
  };

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