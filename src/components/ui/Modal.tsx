import { Modal as RNModal, View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useColorScheme } from 'nativewind';
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
  const { colorScheme } = useColorScheme();

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
              style={{
                width: '100%',
                borderRadius: 16,
                overflow: 'hidden',
                backgroundColor: colorScheme === 'dark' ? '#27272a' : '#f4f4f5',
                borderWidth: 1,
                borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,1)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 10,
                paddingHorizontal: 24,
                paddingVertical: 24,
              }}
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
