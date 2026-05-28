import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import StackNavigator from '@/navigation/StackNavigator';
import "./global.css";
import Toast from 'react-native-toast-message';
import toastConfig from '@/components/ui/Toast';
import { AuthProvider } from '@/context/AuthContext';
import { DocumentCacheProvider } from '@/context/DocumentCacheContext';
import { DocumentPreferencesProvider } from '@/context/DocumentPreferencesContext';
import { useEffect } from 'react';
import { initDatabase } from '@/storage/database';
import { runMigrations } from '@/storage/migrations';
import { initializeOfflineDocumentService, syncWithServer } from '@/services/offlineDocumentService';

export default function App() {
  useEffect(() => {
    initDatabase();
    runMigrations();
    initializeOfflineDocumentService();
    syncWithServer();
  }, []);

  return (
    <AuthProvider>
      <DocumentCacheProvider>
        <DocumentPreferencesProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <StackNavigator />
          </NavigationContainer>
          <Toast config={toastConfig} />
        </DocumentPreferencesProvider>
      </DocumentCacheProvider>
    </AuthProvider>
  );
}
