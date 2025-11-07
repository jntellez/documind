import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';

import Home from '@/screens/home/Home';
import Documents from "@/screens/documents/Documents"
import Settings from "@/screens/settings/Settings"
import { RootTabParamList } from '@/../types';
import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? '#18181b' : '#f4f4f5',
        },
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#287df4',
        },
        headerRight: () => (
          <TouchableOpacity className="flex items-center justify-center p-1 rounded-full bg-gray-200 dark:bg-gray-700 w-10 h-10 mr-6">
            <Text className="text-black dark:text-white">J</Text>
          </TouchableOpacity>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconEmoji;
          if (route.name === 'Home') iconEmoji = <Octicons name="home-fill" size={24} color={focused ? "#007AFF" : "#989898"} />;
          else if (route.name === 'Documents') iconEmoji = <Ionicons name="tablet-portrait" size={24} color={focused ? "#007AFF" : "#989898"} />;
          else if (route.name === 'Settings') iconEmoji = <Ionicons name="settings-sharp" size={24} color={focused ? "#007AFF" : "#989898"} />;
          return <Text style={{ fontSize: 24, color: color }}>{iconEmoji}</Text>;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: isDark ? '#18181b' : 'white'
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ headerTitle: 'Documind', }}
      />
      <Tab.Screen
        name="Documents"
        component={Documents}
        options={{ headerTitle: 'Documents' }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{ headerTitle: 'Settings' }}
      />
    </Tab.Navigator >
  );
}

