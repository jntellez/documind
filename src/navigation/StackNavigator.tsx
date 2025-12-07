import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "types";
import { useColorScheme } from "nativewind";
import Avatar from "@/components/ui/Avatar";
import Octicons from '@expo/vector-icons/Octicons';
import Feather from '@expo/vector-icons/Feather';

// Importación de pantallas
import Login from "@/screens/auth/Login";
import TabNavigator from "./TabNavigator";
import Document from "@/screens/document/Document";
import Button from "@/components/ui/Button";
import { LinearGradient } from "expo-linear-gradient";
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
  const rgb = isDark ? '24, 24, 27' : '244, 244, 245'; // Zinc-900 o Zinc-100

  return (
    <Stack.Navigator
      initialRouteName="Login"
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
        headerRight: () =>
          <Avatar
            fallback="J"
            src="https://avatars.githubusercontent.com/u/101893361?v=4"
            alt="jntellez"
            classname="mr-4"
          />
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

      {/* Document Detail Screen */}
      <Stack.Screen
        name="Document"
        component={Document}
        options={({ route, navigation }) => ({
          headerTitle: () => null,
          headerShown: true,
          headerLeft: () => <Button
            className="ml-4"
            variant="icon-only"
            icon={<Octicons name="chevron-left" size={19} color={isDark ? '#fff' : '#000'} />}
            onPress={() => navigation.goBack()}
          />,
          headerRight: () => <Button
            className="mr-4"
            variant="icon-only"
            icon={<Feather name="headphones" size={19} color={isDark ? '#fff' : '#000'} />}
            onPress={() => { }}
          />,
        })}
      />
    </Stack.Navigator>
  );
}