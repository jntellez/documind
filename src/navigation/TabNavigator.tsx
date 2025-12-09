import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useColorScheme } from 'nativewind';

import Home from '@/screens/home/Home';
import Documents from "@/screens/documents/Documents"
import Settings from "@/screens/settings/Settings"
import { RootTabParamList } from '@/../types';
import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Avatar from '@/components/ui/Avatar';
import { GradientTitle } from '@/components/ui/Typography';
import { useAuth } from '@/context/AuthContext';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  const { user } = useAuth();
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
        headerRight: () => <Avatar
          fallback={user?.name?.charAt(0).toUpperCase() || 'U'}
          src={user?.avatar_url}
          alt={user?.name || 'User'}
          classname="mr-4"
        />,
        tabBarIcon: ({ focused, color, size }) => {
          let iconEmoji;
          if (route.name === 'Home') iconEmoji = <Octicons name="home-fill" size={24} color={focused ? "#009bfb" : "#9f9fa9"} />;
          else if (route.name === 'Documents') iconEmoji = <Ionicons name="tablet-portrait" size={24} color={focused ? "#009bfb" : "#9f9fa9"} />;
          else if (route.name === 'Settings') iconEmoji = <Ionicons name="settings-sharp" size={24} color={focused ? "#009bfb" : "#9f9fa9"} />;
          return <Text style={{ fontSize: 24, color: color }}>{iconEmoji}</Text>;
        },
        tabBarActiveTintColor: '#009bfb',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: isDark ? '#18181b' : 'white',
          borderTopWidth: 1,
          borderTopColor: "#fff3"
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerTitle: () => <GradientTitle>Documind</GradientTitle>
        }}
      />
      <Tab.Screen
        name="Documents"
        component={Documents}
        options={{
          headerTitle: () => <GradientTitle>Documents</GradientTitle>
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          headerTitle: () => <GradientTitle>Settings</GradientTitle>
        }}
      />
    </Tab.Navigator >
  );
}

