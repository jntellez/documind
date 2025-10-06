import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "types";
// Importación de pantallas
import Login from "@/screens/auth/Login";
import Home from "@/screens/home/Home";
/**
 * Creamos el Stack Navigator con tipado
 */
const Stack = createStackNavigator<RootStackParamList>();
/**
 * Componente principal de navegación
 * Gestiona todas las rutas de la aplicación
 */
export default function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6200ea",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
      }}
    >
      {/* Login Screen */}
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          title: "Iniciar Sesión",
          headerShown: false, // Ocultamos el header en login
        }}
      />
      {/* Home Screen */}
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          title: "Home",
          headerLeft: () => null, // Evitamos el botón de regreso
        }}
      />
    </Stack.Navigator>
  );
}