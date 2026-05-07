import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useRef } from 'react';

import Home from '@/screens/home/Home';
import Documents from "@/screens/documents/Documents"
import Settings from "@/screens/settings/Settings"
import { RootTabParamList } from 'types';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'types';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GradientTitle } from '@/components/ui/Typography';
import { useUiTheme } from '@/theme/useUiTheme';

const Tab = createBottomTabNavigator<RootTabParamList>();

type FloatingTabBarProps = BottomTabBarProps & {
  isDark: boolean;
  theme: ReturnType<typeof useUiTheme>;
};

type FloatingTabBarItemProps = {
  focused: boolean;
  label: string;
  color: string;
  isDark: boolean;
  theme: ReturnType<typeof useUiTheme>;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
};

function FloatingTabBarItem({
  focused,
  label,
  color,
  isDark,
  theme,
  onPress,
  accessibilityLabel,
  testID,
}: FloatingTabBarItemProps) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      damping: 16,
      stiffness: 220,
      mass: 0.9,
    }).start();
  }, [focused, progress]);

  const animatedCardStyle = {
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1],
        }),
      },
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [2, 0],
        }),
      },
    ],
  };

  const animatedLabelStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.72, 1],
    }),
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.tabBarItem}
    >
      <Animated.View
        style={[
          styles.tabBarItemContent,
          animatedCardStyle,
          focused && {
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
            shadowOpacity: isDark ? 0.22 : 0.1,
            elevation: 4,
          },
        ]}
      >
        {label === 'Home' ? (
          <Icon library="octicons" name="home-fill" size={focused ? "lg" : "xl"} color={color} />
        ) : label === 'Documents' ? (
          <Icon library="ionicons" name="tablet-portrait" size={focused ? "lg" : "xl"} color={color} />
        ) : (
          <Icon library="ionicons" name="settings-sharp" size={focused ? "lg" : "xl"} color={color} />
        )}
        <Animated.Text
          style={[
            styles.tabBarLabel,
            animatedLabelStyle,
            {
              color,
              fontWeight: focused ? '600' : '500',
            },
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function FloatingTabBar({ state, descriptors, navigation, isDark, theme }: FloatingTabBarProps) {
  return (
    <View pointerEvents="box-none" style={styles.tabBarWrapper}>
      <View
        style={[
          styles.tabBarContainer,
          {
            borderColor: theme.border,
            shadowOpacity: isDark ? 0.28 : 0.14,
          },
        ]}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 99,
              overflow: 'hidden',
              backgroundColor: theme.background,
            },
          ]}
        >
          <BlurView
            intensity={15}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;
          const color = focused ? theme.primary : theme.mutedForeground;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <FloatingTabBarItem
              key={route.key}
              focused={focused}
              label={typeof label === 'string' ? label : route.name}
              color={color}
              isDark={isDark}
              theme={theme}
              onPress={onPress}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabNavigator() {
  const { user } = useAuth();
  const theme = useUiTheme();
  const isDark = theme.isDark;
  const rgb = isDark ? '24, 24, 27' : '244, 244, 245';
  const stackNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} isDark={isDark} theme={theme} />}
      screenOptions={({ route }) => ({
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
        headerShown: true,
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerRight: () => <Avatar
          fallback={user?.name?.charAt(0).toUpperCase() || 'U'}
          src={user?.avatar_url}
          alt={user?.name || 'User'}
          className="mr-4"
          onPress={() => stackNavigation.navigate(user ? 'Profile' : 'Login')}
        />,
        tabBarHideOnKeyboard: true,
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

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: 52,
    right: 52,
    bottom: 20,
    height: 70,
  },
  tabBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 99,
    borderWidth: 1,
    borderTopWidth: 1,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 10,
    elevation: 8,
    overflow: 'visible',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  tabBarItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarItemContent: {
    width: 90,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 0,
  },
  tabBarLabel: {
    marginTop: 2,
    fontSize: 10,
  },
});
