import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import StackNavigator from '@/navigation/StackNavigator';
import "./global.css";
import Toast from 'react-native-toast-message';
import toastConfig from '@/components/ui/Toast';
import { AuthProvider } from '@/context/AuthContext';
import { DocumentCacheProvider } from '@/context/DocumentCacheContext';

export default function App() {
  return (
    <AuthProvider>
      <DocumentCacheProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <StackNavigator />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </DocumentCacheProvider>
    </AuthProvider>
  );
}