import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/../types';

type LoginScreenNavigationProp = StackScreenProps<RootStackParamList, 'Login'>;
interface LoginScreenProps extends LoginScreenNavigationProp { }

export default function Login({ navigation }: LoginScreenProps) {
  const handleLogin = (provider: 'google' | 'github') => {
    navigation.replace('Home');
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <StatusBar barStyle="dark-content" />
      <View
        className={`
          w-11/12 max-w-sm p-8
          bg-white/30 
          border border-white/40
          rounded-3xl shadow-2xl
          backdrop-blur-xl 
        `}
      >
        <View className="items-center mb-8">
          <View className="p-4 bg-white rounded-full shadow-lg">
            <Text className="text-4xl text-gray-800">📄</Text>
          </View>
        </View>
        <Text className="text-2xl font-bold text-center text-gray-900 mb-2">
          Log in to Documind
        </Text>
        <Text className="text-base text-gray-700 text-center mb-6">
          Log in with your preferred provider:
        </Text>
        <TouchableOpacity
          onPress={() => handleLogin('google')}
          className={`
            flex-row items-center justify-center 
            w-full p-3 my-2 space-x-3
            bg-white border border-gray-300 rounded-lg
            shadow-sm
          `}
        >
          <Text className="text-xl">G</Text>
          <Text className="font-semibold text-base text-gray-700">
            Continue with Google
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleLogin('github')}
          className={`
            flex-row items-center justify-center 
            w-full p-3 my-2 space-x-3
            bg-gray-800 border border-gray-700 rounded-lg
            shadow-sm
          `}
        >
          <Text className="text-xl">🐈</Text>
          <Text className="font-semibold text-base text-white">
            Continue with GitHub
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}