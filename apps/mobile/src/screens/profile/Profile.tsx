import { ScrollView } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/context/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfo from '@/components/profile/PersonalInfo';
import ActivityStats from '@/components/profile/ActivityStats';
import DeleteAccountModal from '@/components/profile/DeleteAccountModal';
import ScreenContainer from '@/components/ui/ScreenContainer';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import AuthRequiredState from '@/components/ui/AuthRequiredState';
import { useSettingsActions } from '@/screens/settings/useSettingsActions';

function AuthenticatedProfile() {
  const { handleLogout } = useSettingsActions();
  const {
    name,
    email,
    initials,
    avatarUrl,
    documentsCount,
    documentsLimit,
    processingUsage,
    chatUsage,
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
        <ActivityStats
          documentsCount={documentsCount}
          documentsLimit={documentsLimit}
          processingUsage={processingUsage}
          chatUsage={chatUsage}
        />
        <Button
          title="Logout"
          variant="icon"
          icon={<Icon library="ionicons" name="log-out-outline" size="lg" tone="mutedForeground" />}
          onPress={handleLogout}
          className="mt-4"
        />
        <Button
          title="Delete Account"
          variant="icon"
          icon={<Icon library="ionicons" name="trash-outline" size="lg" tone="destructive" />}
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

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <ScreenContainer className="pt-34">
        <AuthRequiredState
          title="Profile requires an account"
          description="Log in to manage your profile, review your usage, and access account settings."
        />
      </ScreenContainer>
    );
  }

  return <AuthenticatedProfile />;
}
