import { ScrollView } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfo from '@/components/profile/PersonalInfo';
import ActivityStats from '@/components/profile/ActivityStats';
import DeleteAccountModal from '@/components/profile/DeleteAccountModal';
import ScreenContainer from '@/components/ui/ScreenContainer';
import Button from '@/components/ui/Button';
import Ionicons from '@expo/vector-icons/Ionicons';

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
    <ScreenContainer>
      <ScrollView
        className="flex-1 pt-24"
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader name={name} email={email} initials={initials} avatarUrl={avatarUrl} />
        <PersonalInfo name={name} email={email} />
        <ActivityStats documentsCount={documentsCount} />
        <Button
          title="Delete Account"
          variant="icon"
          icon={<Ionicons name="trash-outline" size={20} />}
          tone="destructive"
          onPress={openDeleteModal}
          className="mt-4"
        />
      </ScrollView>

      <DeleteAccountModal
        visible={showDeleteModal}
        isDeleting={isDeleting}
        canConfirm={canConfirmDelete}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAccount}
        onChangeText={setConfirmText}
      />
    </ScreenContainer>
  );
}
