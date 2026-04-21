import React, { useState } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import DocumentItem from '@/components/documents/DocumentItem';
import EmptyState from '@/components/documents/EmptyState';
import { useDocuments } from '@/hooks/useDocuments';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Feather } from '@expo/vector-icons';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import FloatingStatus from '@/components/ui/FloatingStatus';
import InputActionField from '@/components/ui/InputActionField';
import Screen from '@/components/ui/Screen';
import TagChip from '@/components/ui/TagChip';
import { Paragraph } from '@/components/ui/Typography';
import { useUiTheme } from '@/theme/useUiTheme';

export default function Documents() {
  const theme = useUiTheme();

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
      <Screen contentClassName="flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" color={theme.primary} />
        <Paragraph className="mt-4 text-center">
          {isOnline ? 'Syncing documents...' : 'Loading documents...'}
        </Paragraph>
      </Screen>
    );
  }

  return (
    <Screen contentClassName="flex-1 p-4 pt-6">
      {!isOnline && (
        <FloatingStatus
          label="Offline Mode"
          icon={<Feather name="wifi-off" size={16} color={theme.warning} />}
        />
      )}

      <View className="mb-4 z-10">
        <InputActionField
          placeholder="Buscar documentos"
          onChangeText={setSearchQuery}
          type="text"
          showError={false}
          autoCapitalize="none"
          className="p-5"
          leadingIcon={<Feather name="search" size={18} color={theme.iconMuted} />}
        />
      </View>

      <CollapsibleCard
        className="mb-4 z-20"
        title={`Filtrar por Etiquetas${selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}`}
        description="Filter the document list by your saved tags."
        icon={<Feather name="filter" size={16} color={theme.iconMuted} />}
        isOpen={isDropdownOpen}
        onToggle={() => setIsDropdownOpen((current) => !current)}
      >
        {availableTags.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);

              return (
                <TagChip
                  key={`dropdown-tag-${tag}`}
                  label={tag}
                  selected={isSelected}
                  onPress={() => toggleTagFilter(tag)}
                  accessory={
                    isSelected ? (
                      <Feather name="check" size={14} color={theme.primaryForeground} />
                    ) : undefined
                  }
                />
              );
            })}
          </View>
        ) : (
          <Paragraph className="py-2 text-center text-sm font-medium">
            No hay etiquetas disponibles
          </Paragraph>
        )}
      </CollapsibleCard>

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
            tintColor={theme.primary}
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
    </Screen>
  );
}
