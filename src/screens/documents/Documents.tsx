import React, { useState } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import DocumentItem from '@/components/documents/DocumentItem';
import EmptyState from '@/components/documents/EmptyState';
import { useDocuments } from '@/hooks/useDocuments';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Feather } from '@expo/vector-icons';

export default function Documents() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    isLoading,
    isRefreshing,
    isOnline,
    filteredDocuments,
    handleRefresh,
    handleDelete,
    handleShare,
    handlePressDocument,
    setSearchQuery,
    availableTags,
    selectedTags,
    toggleTagFilter,
    isTagModalVisible,
    tagInput,
    setTagInput,
    openTagModal,
    closeTagModal,
    handleSaveTag
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
      <View className="mb-4 z-10 h-15.5 relative">
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

      {/* Componente de Filtrado con estilo Glass (Refactorizado) */}
      <View
        className="mb-4 z-20 overflow-hidden bg-white/50 dark:bg-zinc-900/60 rounded-2xl border border-white/20 dark:border-white/20 shadow-lg"
      >
        {/* Cabecera del Dropdown */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex-row items-center justify-between px-4 py-3.5"
        >
          <View className="flex-row items-center">
            <Feather name="filter" size={16} color={isDark ? '#a1a1aa' : '#52525b'} />
            <Text className="ml-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Filtrar por Etiquetas {selectedTags.length > 0 ? `(${selectedTags.length})` : ''}
            </Text>
          </View>
          <Feather
            name={isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={isDark ? '#a1a1aa' : '#52525b'}
          />
        </TouchableOpacity>

        {/* Contenido del Desplegable (Con separador interno glassy) */}
        {isDropdownOpen && (
          <View className="border-t border-white/10 dark:border-zinc-700/50 p-4">
            {availableTags.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={`dropdown-tag-${tag}`}
                      onPress={() => toggleTagFilter(tag)}
                      className={`flex-row items-center px-3.5 py-1.5 rounded-xl border shadow-sm ${isSelected
                        ? 'bg-zinc-900/90 border-zinc-900 dark:bg-zinc-100/90 dark:border-zinc-100'
                        : 'bg-white/40 border-white/10 dark:bg-zinc-800/50 dark:border-zinc-700/50'
                        }`}
                    >
                      <Text
                        className={`text-sm font-medium ${isSelected
                          ? 'text-white dark:text-black'
                          : 'text-zinc-700 dark:text-zinc-200'
                          }`}
                      >
                        {tag}
                      </Text>
                      {isSelected && (
                        <Feather name="check" size={14} color={isDark ? '#000' : '#fff'} className="ml-1.5" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-2 font-medium">
                No hay etiquetas disponibles
              </Text>
            )}
          </View>
        )}
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
            onAddTag={() => openTagModal(item)}
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

      <Modal
        visible={isTagModalVisible}
        onClose={closeTagModal}
        title="Add new tag"
        description="Write a short keyword to organize this document."
      >
        <View className="mt-2">
          <View className="h-14">

            <Input
              placeholder="e.g. aws, ux, react..."
              value={tagInput}
              onChangeText={setTagInput}
              autoCapitalize="none"
              autoCorrect={false}
              showError={false}
            />
          </View>
          <View className="flex-row mt-4 gap-3">
            <Button
              title="Cancel"
              onPress={closeTagModal}
              className="flex-1"
            />
            <Button
              title="Save Tag"
              onPress={handleSaveTag}
              disabled={!tagInput.trim()}
              className="flex-1"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}