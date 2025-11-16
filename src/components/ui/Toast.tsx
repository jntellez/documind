import { View, Text } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastConfig {
  text1?: string;
  text2?: string;
}

const toastConfig = {
  success: (props: ToastConfig) => (
    <View className="bg-green-500 dark:bg-green-600 mx-4 p-4 rounded-2xl border border-green-400 dark:border-green-500 shadow-lg flex-row items-center">
      <Ionicons name="checkmark-circle" size={24} color="white" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-bold text-base">{props.text1}</Text>
        {props.text2 && (
          <Text className="text-white/90 text-sm mt-1">{props.text2}</Text>
        )}
      </View>
    </View>
  ),

  error: (props: ToastConfig) => (
    <View className="bg-red-500 dark:bg-red-600 mx-4 p-4 rounded-2xl border border-red-400 dark:border-red-500 shadow-lg flex-row items-center">
      <Ionicons name="close-circle" size={24} color="white" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-bold text-base">{props.text1}</Text>
        {props.text2 && (
          <Text className="text-white/90 text-sm mt-1">{props.text2}</Text>
        )}
      </View>
    </View>
  ),

  info: (props: ToastConfig) => (
    <View className="bg-blue-500 dark:bg-blue-600 mx-4 p-4 rounded-2xl border border-blue-400 dark:border-blue-500 shadow-lg flex-row items-center">
      <Ionicons name="information-circle" size={24} color="white" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-bold text-base">{props.text1}</Text>
        {props.text2 && (
          <Text className="text-white/90 text-sm mt-1">{props.text2}</Text>
        )}
      </View>
    </View>
  ),

  warning: (props: ToastConfig) => (
    <View className="bg-yellow-500 dark:bg-yellow-600 mx-4 p-4 rounded-2xl border border-yellow-400 dark:border-yellow-500 shadow-lg flex-row items-center">
      <Ionicons name="warning" size={24} color="white" />
      <View className="ml-3 flex-1">
        <Text className="text-white font-bold text-base">{props.text1}</Text>
        {props.text2 && (
          <Text className="text-white/90 text-sm mt-1">{props.text2}</Text>
        )}
      </View>
    </View>
  ),
};

export default toastConfig;