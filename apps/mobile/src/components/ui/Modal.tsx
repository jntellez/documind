import { Modal as RNModal, View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Title, Paragraph } from './Typography';
import { useUiTheme } from '@/theme/useUiTheme';

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function Modal({
  visible,
  onClose,
  title,
  description,
  icon,
  children,
  className,
}: ModalProps) {
  const theme = useUiTheme();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        >
          <Pressable
            onPress={onClose}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.overlay, paddingHorizontal: 24 }}
        >
          <Pressable className="w-full">
            <View
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
              className={`w-full rounded-lg overflow-hidden border shadow-lg px-6 py-6 ${className ?? ''}`}
            >
              <View className="p-0">
                {(icon || title || description) && (
                  <View className="items-center mb-4">
                    {icon}
                    {title && <Title className="text-lg mt-2">{title}</Title>}
                    {description && (
                      <Paragraph className="text-sm text-center mt-2 opacity-70">
                        {description}
                      </Paragraph>
                    )}
                  </View>
                )}
                {children}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
