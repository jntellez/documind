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
import AuthRequiredState from '@/components/ui/AuthRequiredState';
import { useAuth } from '@/context/AuthContext';

function AuthenticatedDocuments() {
  const theme = useUiTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    isLoading,
    isRefreshing,
    isOnline,
    filteredDocuments,
    syncState,
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
      <ScreenContainer className="items-center justify-center pt-30">
        <ActivityIndicator size="large" color={theme.mutedForeground} />
        <Paragraph className="mt-4">
          {isOnline ? 'Syncing documents' : 'Loading documents'}
        </Paragraph>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 pt-34">
      {(!isOnline || syncState.isSyncing || syncState.pendingCount > 0 || syncState.failedCount > 0) && (
        <Badge size="md" className="absolute shadow-md right-4 bottom-30 z-50" textClassName="font-bold">
          {!isOnline
            ? "Offline Mode"
            : syncState.isSyncing
              ? `Syncing ${syncState.readyCount}`
              : syncState.pendingCount > 0
                ? `Queued ${syncState.pendingCount}`
                : `Failed ${syncState.failedCount}`}
        </Badge>
      )}

      {syncState.lastError && (
        <Paragraph className="mb-2 text-sm text-destructive" numberOfLines={2}>
          Last sync error: {syncState.lastError}
        </Paragraph>
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
          paddingBottom: 120
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

export default function Documents() {
  const { user } = useAuth();

  if (!user) {
    return (
      <ScreenContainer className="flex-1 pt-34">
        <AuthRequiredState
          title="Documents require an account"
          description="Log in to access your saved documents and synced content."
        />
      </ScreenContainer>
    );
  }

  return <AuthenticatedDocuments />;
}
