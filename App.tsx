import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "@/navigation/StackNavigator";
import "./global.css"

export default function App() {
  return <NavigationContainer>
    <StackNavigator />
  </NavigationContainer>
}
