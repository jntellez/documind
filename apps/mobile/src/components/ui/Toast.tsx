import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import Toast from 'react-native-toast-message';

interface ToastConfig {
  text1?: string;
  text2?: string;
}

function GlassToast({
  props,
  iconName,
  iconColor,
}: {
  props: ToastConfig;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}) {
  return (
    <Card className={"flex-row items-center p-4 pl-6 mx-4"}>
      <View className="w-12 h-12 rounded-full shadow-md border border-white dark:border-white/20 items-center justify-center">
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <View className="ml-2 flex-1">
        <Text className="text-zinc-800 dark:text-zinc-100 font-bold text-base">
          {props.text1}
        </Text>
        {props.text2 && (
          <Text className="text-zinc-600 dark:text-zinc-300 text-sm">
            {props.text2}
          </Text>
        )}
      </View>
    </Card>
  );
}

const toastConfig = {
  success: (props: ToastConfig) => (
    <GlassToast
      props={props}
      iconName="checkmark-circle"
      iconColor="#22c55e"
    />
  ),

  error: (props: ToastConfig) => (
    <GlassToast
      props={props}
      iconName="close-circle"
      iconColor="#ef4444"
    />
  ),

  info: (props: ToastConfig) => (
    <GlassToast
      props={props}
      iconName="information-circle"
      iconColor="#3b82f6"
    />
  ),

  warning: (props: ToastConfig) => (
    <GlassToast
      props={props}
      iconName="warning"
      iconColor="#eab308"
    />
  ),
};

export function showToast({ type, text1, text2 }: { type: 'success' | 'error' | 'info' | 'warning'; text1: string; text2?: string }) {
  Toast.show({
    type,
    text1,
    text2,
    position: 'bottom',
    visibilityTime: 4000,
    bottomOffset: 98,
  });
}

export default toastConfig;