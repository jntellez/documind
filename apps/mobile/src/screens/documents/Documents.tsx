import React, { useState } from 'react';
import { FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import DocumentItem from '@/components/documents/DocumentItem';
import DocumentsSearchBar from '@/components/documents/DocumentsSearchBar';
import DocumentTagFilterCard from '@/components/documents/DocumentTagFilterCard';
import DocumentTagModal from '@/components/documents/DocumentTagModal';
import EmptyState from '@/components/documents/EmptyState';
import { useDocuments } from '@/hooks/useDocuments';
import ScreenContainer from '@/components/ui/ScreenContainer';
import { useUiTheme } from '@/theme/useUiTheme';
import { Paragraph } from '@/components/ui/Typography';
import Badge from '@/components/ui/Badge';

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
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={theme.mutedForeground} />
        <Paragraph className="mt-4">
          {isOnline ? 'Syncing documents' : 'Loading documents'}
        </Paragraph>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="pt-6">
      {!isOnline && (
        <Badge size="md" className="absolute shadow-md right-4 bottom-4 z-50" textClassName="font-bold">
          Offline Mode
        </Badge>
      )}

      <DocumentsSearchBar onChangeText={setSearchQuery} />

      <DocumentTagFilterCard
        availableTags={availableTags}
        selectedTags={selectedTags}
        isOpen={isDropdownOpen}
        onToggleOpen={() => setIsDropdownOpen((current) => !current)}
        onToggleTag={toggleTagFilter}
      />

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
            tintColor={theme.mutedForeground}
          />
        }
      />

      <DocumentTagModal
        visible={isTagModalVisible}
        tagInput={tagInput}
        onChangeTagInput={setTagInput}
        onClose={closeTagModal}
        onSave={handleSaveTag}
      />
    </ScreenContainer>
  );
}
