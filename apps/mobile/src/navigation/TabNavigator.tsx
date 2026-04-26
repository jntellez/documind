import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'nativewind';

import Home from '@/screens/home/Home';
import Documents from "@/screens/documents/Documents"
import Settings from "@/screens/settings/Settings"
import { RootTabParamList } from 'types';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import { GradientTitle } from '@/components/ui/Typography';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const stackNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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
          className="mr-4"
          onPress={() => stackNavigation.navigate(user ? 'Profile' : 'Login')}
        />,
        tabBarIcon: ({ color }) => {
          if (route.name === 'Home') return <Icon library="octicons" name="home-fill" size="xl" color={color} />;
          if (route.name === 'Documents') return <Icon library="ionicons" name="tablet-portrait" size="xl" color={color} />;
          return <Icon library="ionicons" name="settings-sharp" size="xl" color={color} />;
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
