import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "types";
import { useColorScheme } from "nativewind";
import { GradientTitle } from "@/components/ui/Typography";
import Avatar from "@/components/ui/Avatar";
// Importación de pantallas
import Login from "@/screens/auth/Login";
import TabNavigator from "./TabNavigator";
import Document from "@/screens/document/Document";
/**
 * Creamos el Stack Navigator con tipado
 */
const Stack = createStackNavigator<RootStackParamList>();
/**
 * Componente principal de navegación
 * Gestiona todas las rutas de la aplicación
 */
export default function StackNavigator() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#18181b' : '#f4f4f5',
        },
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerRight: () => <Avatar
          fallback="J"
          src="https://avatars.githubusercontents.com/u/101893361?v=4"
          alt="jntellez"
          classname="mr-4"
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
        name="Home"
        component={TabNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* Document Detail Screen */}
      <Stack.Screen
        name="Document"
        component={Document}
        options={{
          headerTitle: () => <GradientTitle title="Document" />,
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}