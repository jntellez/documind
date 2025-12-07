import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import StackNavigator from '@/navigation/StackNavigator';
import "./global.css";
import Toast from 'react-native-toast-message';
import toastConfig from '@/components/ui/Toast';
import { AuthProvider } from '@/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <StackNavigator />
      </NavigationContainer>
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}