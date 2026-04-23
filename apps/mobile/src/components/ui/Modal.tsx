import { Modal as RNModal, View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { cn } from '@/lib/cn';
import { Title, Paragraph } from './Typography';

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
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          onPress={onClose}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 24 }}
        >
          <Pressable className="w-full">
            <View
              className={cn(
                'w-full rounded-lg overflow-hidden border bg-surface dark:bg-dark-surface border-border dark:border-dark-border shadow-lg px-6 py-6',
                className,
              )}
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
