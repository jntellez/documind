import { View, ScrollView, Pressable, Alert } from "react-native";
import { useColorScheme } from 'nativewind';
import { useAuth } from '@/context/AuthContext';
import { useDocumentCache } from '@/context/DocumentCacheContext';
import { useNavigation } from '@react-navigation/native';
import { SettingsScreenProps } from 'types';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { Title, Paragraph } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { CommonActions } from '@react-navigation/native';

export default function Settings() {
  const navigation = useNavigation<SettingsScreenProps['navigation']>();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { user, signOut } = useAuth();
  const { clearCache } = useDocumentCache();
  const isDark = colorScheme === 'dark';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              clearCache();

              Toast.show({
                type: 'success',
                text1: 'Logged out',
                text2: 'You have been successfully logged out',
                position: 'bottom',
                visibilityTime: 2000,
                bottomOffset: 40,
              });

              // Redirigir a Login y resetear el stack
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                })
              );
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to logout',
                position: 'bottom',
                visibilityTime: 3000,
                bottomOffset: 40,
              });
            }
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached documents. You will need to reload them.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearCache();
            Toast.show({
              type: 'success',
              text1: 'Cache cleared',
              text2: 'All cached documents have been removed',
              position: 'bottom',
              visibilityTime: 2000,
              bottomOffset: 40,
            });
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900">
      <ScrollView
        className="flex-1 p-4 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Perfil de Usuario - Solo si está autenticado */}
        {user && (
          <View className="items-center py-4 mb-6">
            <Avatar
              src={user.avatar_url}
              fallback={user.name?.charAt(0).toUpperCase() || 'U'}
              alt={user.name || 'User'}
            />
            <Title className="text-xl mt-4 mb-1">
              {user.name || 'Unknown User'}
            </Title>
            <Paragraph className="text-sm">
              {user.email || 'no-email@example.com'}
            </Paragraph>
          </View>
        )}

        {/* Mensaje de bienvenida si no está autenticado */}
        {!user && (
          <View className="items-center py-8 mb-2">
            <View className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center mb-4">
              <Ionicons
                name="person-outline"
                size={40}
                color={isDark ? '#71717a' : '#a1a1aa'}
              />
            </View>
            <Title className="text-xl mb-2">
              Welcome to Documind
            </Title>
            <Paragraph className="text-center mb-6">
              Login to access all features
            </Paragraph>
            <Button
              onPress={handleLogin}
              title="Login"
              icon={<Ionicons name="log-in-outline" size={20} color="#fff" />}
            />
          </View>
        )}

        {/* Apariencia - Siempre visible */}
        <View className="mb-6">
          <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-60">
            Appearance
          </Paragraph>
          <Card>
            <Pressable
              onPress={toggleColorScheme}
              className="flex-row items-center justify-between p-4 active:opacity-70"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full shadow-md border border-white dark:border-white/20 items-center justify-center mr-3">
                  <Ionicons
                    name={isDark ? 'moon' : 'sunny'}
                    size={20}
                    color={isDark ? '#ccc' : '#333'}
                  />
                </View>
                <View className="flex-1">
                  <Paragraph className="font-semibold text-zinc-900 dark:text-white mb-0.5">
                    Theme
                  </Paragraph>
                  <Paragraph className="text-sm">
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </Paragraph>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? '#71717a' : '#a1a1aa'}
              />
            </Pressable>
          </Card>
        </View>

        {/* Data & Storage - Solo si está autenticado */}
        {user && (
          <View className="mb-6">
            <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-60">
              Data & Storage
            </Paragraph>
            <Card>
              <Pressable
                onPress={handleClearCache}
                className="flex-row items-center justify-between p-4 active:opacity-70"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full border shadow-md border-white dark:border-white/20 items-center justify-center mr-3">
                    <Ionicons name="trash-outline" size={20} color={isDark ? '#ccc' : '#333'} />
                  </View>
                  <View className="flex-1">
                    <Paragraph className="font-semibold text-zinc-900 dark:text-white mb-0.5">
                      Clear Cache
                    </Paragraph>
                    <Paragraph className="text-sm">
                      Remove all cached documents
                    </Paragraph>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? '#71717a' : '#a1a1aa'}
                />
              </Pressable>
            </Card>
          </View>
        )}

        {/* About - Siempre visible */}
        <View className="mb-6">
          <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-60">
            About
          </Paragraph>
          <Card>
            <View className="p-4">
              <Paragraph className="font-semibold text-zinc-900 dark:text-white mb-2">
                Documind
              </Paragraph>
              <Paragraph className="text-sm mb-1">
                Version 1.0.0
              </Paragraph>
              <Paragraph className="text-sm">
                © 2025 Documind. All rights reserved.
              </Paragraph>
            </View>
          </Card>
        </View>

        {/* Botón de Logout - Solo si está autenticado */}
        {user && (
          <Button
            onPress={handleLogout}
            title="Logout"
            variant="icon"
            icon={<Ionicons name="log-out-outline" size={20} color="#ef4444" />}
            className="text-red-500"
          />
        )}
      </ScrollView>
    </View>
  );
}