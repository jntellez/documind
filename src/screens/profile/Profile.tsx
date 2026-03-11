import { View, ScrollView } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfo from '@/components/profile/PersonalInfo';
import ActivityStats from '@/components/profile/ActivityStats';
import DangerZone from '@/components/profile/DangerZone';
import DeleteAccountModal from '@/components/profile/DeleteAccountModal';

export default function Profile() {
  const {
    name,
    email,
    initials,
    avatarUrl,
    documentsCount,
    showDeleteModal,
    isDeleting,
    canConfirmDelete,
    setConfirmText,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteAccount,
  } = useProfile();

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900">
      <ScrollView
        className={`flex-1 p-4 pt-24 ${showDeleteModal ? 'opacity-50' : 'opacity-100'}`}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader name={name} email={email} initials={initials} avatarUrl={avatarUrl} />
        <PersonalInfo name={name} email={email} />
        <ActivityStats documentsCount={documentsCount} />
        <DangerZone onDeletePress={openDeleteModal} />
      </ScrollView>

      <DeleteAccountModal
        visible={showDeleteModal}
        isDeleting={isDeleting}
        canConfirm={canConfirmDelete}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAccount}
        onChangeText={setConfirmText}
      />
    </View>
  );
}
