import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import TabNavigator from '@/navigation/TabNavigator';
import "./global.css";

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TabNavigator />
    </NavigationContainer>
  );
}

