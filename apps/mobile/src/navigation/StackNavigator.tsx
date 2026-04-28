import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "types";
import { useColorScheme } from "nativewind";
import Avatar from "@/components/ui/Avatar";
import Icon from '@/components/ui/Icon';

// Importación de pantallas
import Login from "@/screens/auth/Login";
import TabNavigator from "./TabNavigator";
import Document from "@/screens/document/Document";
import DocumentChat from "@/screens/document/DocumentChat";
import Profile from "@/screens/profile/Profile";
import Button from "@/components/ui/Button";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthContext";
/**
 * Creamos el Stack Navigator con tipado
 */
const Stack = createStackNavigator<RootStackParamList>();
/**
 * Componente principal de navegación
 * Gestiona todas las rutas de la aplicación
 */
export default function StackNavigator() {
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const rgb = isDark ? '24, 24, 27' : '244, 244, 245'; // Zinc-900 o Zinc-100

  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerTransparent: true,
        headerBackground: () => (
          <LinearGradient
            colors={[
              `rgba(${rgb}, 1)`,
              `rgba(${rgb}, 0.9)`,
              `rgba(${rgb}, 0.5)`,
              `rgba(${rgb}, 0)`
            ]}
            locations={[0, 0.4, 0.8, 1]}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        ),
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerRight: () => <Avatar
          fallback={user?.name.charAt(0).toUpperCase() || 'U'}
          src={user?.avatar_url}
          alt={user?.name || 'User'}
          className="mr-4"
        />,
      }}
    >
      {/* Login Screen */}
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: false, // Ocultamos el header en login
        }}
      />

      {/* Home Screen (TabNavigator) */}
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* Profile Screen */}
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={({ navigation }) => ({
          headerTitle: () => null,
          headerShown: true,
          headerLeft: () => <Button
            className="ml-4"
            variant="icon-only"
            icon={<Icon library="octicons" name="chevron-left" size="lg" tone="foreground" />}
            onPress={() => navigation.goBack()}
          />,
          headerRight: () => null,
        })}
      />

      {/* Document Detail Screen */}
      <Stack.Screen
        name="Document"
        component={Document}
        options={({ navigation }) => ({
          headerTitle: () => null,
          headerShown: true,
          headerLeft: () => <Button
            className="ml-4"
            variant="icon-only"
            icon={<Icon library="octicons" name="chevron-left" size="lg" />}
            onPress={() => navigation.goBack()}
          />,
          headerRight: () => null,
        })}
      />

      <Stack.Screen
        name="DocumentChat"
        component={DocumentChat}
        options={({ navigation }) => ({
          headerTitle: () => null,
          headerShown: true,
          headerLeft: () => <Button
            className="ml-4"
            variant="icon-only"
            icon={<Icon library="octicons" name="chevron-left" size="lg" />}
            onPress={() => navigation.goBack()}
          />,
          headerRight: () => null,
        })}
      />
    </Stack.Navigator>
  );
}
