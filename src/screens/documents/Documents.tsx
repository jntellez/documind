import React from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import DocumentItem from '@/components/documents/DocumentItem';
import EmptyState from '@/components/documents/EmptyState';
import { useDocuments } from '@/hooks/useDocuments';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Feather } from '@expo/vector-icons';

export default function Documents() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    isLoading,
    isRefreshing,
    isOnline,
    filteredDocuments,
    handleRefresh,
    handleDelete,
    handleShare,
    handlePressDocument,
    setSearchQuery
  } = useDocuments();

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
      {!isOnline && (
        <Button title="Offline Mode" className="absolute right-4 bottom-4 z-50" />
      )}

      {/* Barra de Búsqueda */}
      <View className="mb-6 z-10 h-15.5">
        <Input
          placeholder="Buscar documentos"
          onChangeText={setSearchQuery}
          type="text"
          showError={false}
          autoCapitalize="none"
          className="p-5 pl-15"
        />
        <View className="w-[40px] h-[40px] absolute left-2 top-2 items-center justify-center">
          <Feather name="search" size={18} color="#666" />
        </View>
      </View>

      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DocumentItem
            document={item}
            onPress={() => handlePressDocument(item)}
            onDelete={() => handleDelete(item.id)}
            onShare={() => handleShare(item)}
          />
        )}
        contentContainerStyle={{
          flexGrow: 1,
          gap: 16,
          paddingBottom: 20
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