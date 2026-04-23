import { View } from 'react-native';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

type DocumentTagModalProps = {
  visible: boolean;
  tagInput: string;
  onChangeTagInput: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function DocumentTagModal({
  visible,
  tagInput,
  onChangeTagInput,
  onClose,
  onSave,
}: DocumentTagModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Add new tag"
      description="Write a short keyword to organize this document."
    >
      <View className="mt-2">
        <View className="h-14">
          <Input
            placeholder="e.g. aws, ux, react..."
            value={tagInput}
            onChangeText={onChangeTagInput}
            autoCapitalize="none"
            autoCorrect={false}
            showError={false}
          />
        </View>

        <View className="flex-row mt-4 gap-3">
          <Button title="Cancel" onPress={onClose} className="flex-1" />
          <Button
            title="Save Tag"
            onPress={onSave}
            disabled={!tagInput.trim()}
            className="flex-1"
          />
        </View>
      </View>
    </Modal>
  );
}
