import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import Home from '@/screens/home/Home';
import Documents from "@/screens/documents/Documents"
import Settings from "@/screens/settings/Settings"
import { RootTabParamList } from '@/../types';
import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Avatar from '@/components/ui/Avatar';

const Tab = createBottomTabNavigator<RootTabParamList>();

const GradientTitle = ({ title }: { title: string }) => (
  <MaskedView
    maskElement={
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        {title}
      </Text>
    }
  >
    <LinearGradient
      colors={['#0273a4', '#30b0ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold', opacity: 0 }}>
        {title}
      </Text>
    </LinearGradient>
  </MaskedView>
);

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
        headerRight: () => <Avatar
          fallback="J"
          src="https://avatars.githubusercontents.com/u/101893361?v=4"
          alt="jntellez"
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
          headerTitle: () => <GradientTitle title="Documind" />
        }}
      />
      <Tab.Screen
        name="Documents"
        component={Documents}
        options={{
          headerTitle: () => <GradientTitle title="Documents" />
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          headerTitle: () => <GradientTitle title="Settings" />
        }}
      />
    </Tab.Navigator >
  );
}

