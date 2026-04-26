import { View } from 'react-native';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Paragraph } from '@/components/ui/Typography';

type DeleteAccountModalProps = {
  visible: boolean;
  isDeleting: boolean;
  canConfirm: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChangeText: (text: string) => void;
};

export default function DeleteAccountModal({
  visible,
  isDeleting,
  canConfirm,
  onClose,
  onConfirm,
  onChangeText,
}: DeleteAccountModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Delete Account"
      description="This action is irreversible. All your documents and data will be permanently deleted."
      icon={
        <Icon
          library="ionicons"
          name="warning-outline"
          variant="circle"
          tone="destructive"
          size={30}
        />
      }
    >
      <Paragraph className="text-sm mb-2.5">
        Type <Paragraph className="font-semibold text-foreground dark:text-dark-foreground">"delete account"</Paragraph> to confirm:
      </Paragraph>
      <View className="mb-4 h-14">
        <Input
          placeholder="delete account"
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          showError={false}
          autoFocus
        />
      </View>
      <View className="flex-row gap-3">
        <Button
          title="Cancel"
          onPress={onClose}
          disabled={isDeleting}
          className="flex-1"
        />
        <Button
          title="Delete"
          tone="destructive"
          onPress={onConfirm}
          disabled={!canConfirm || isDeleting}
          loading={isDeleting}
          className="flex-1"
        />
      </View>
    </Modal>
  );
}
