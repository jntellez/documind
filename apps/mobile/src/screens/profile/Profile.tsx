import { useProfile } from '@/hooks/useProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfo from '@/components/profile/PersonalInfo';
import ActivityStats from '@/components/profile/ActivityStats';
import DangerZone from '@/components/profile/DangerZone';
import DeleteAccountModal from '@/components/profile/DeleteAccountModal';
import Screen from '@/components/ui/Screen';

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
    <Screen
      scroll
      contentClassName={`p-4 pt-24 ${showDeleteModal ? 'opacity-50' : 'opacity-100'}`}
    >
        <ProfileHeader name={name} email={email} initials={initials} avatarUrl={avatarUrl} />
        <PersonalInfo name={name} email={email} />
        <ActivityStats documentsCount={documentsCount} />
        <DangerZone onDeletePress={openDeleteModal} />
      

      <DeleteAccountModal
        visible={showDeleteModal}
        isDeleting={isDeleting}
        canConfirm={canConfirmDelete}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAccount}
        onChangeText={setConfirmText}
      />
    </Screen>
  );
}
