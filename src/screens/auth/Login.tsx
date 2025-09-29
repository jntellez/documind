import { Text, View, Button } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigation/StackNavigator";

type LoginScreenNavigationProp = StackScreenProps<RootStackParamList, "Login">;
interface LoginScreenProps extends LoginScreenNavigationProp { }

export default function Login({ navigation }: LoginScreenProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login Screen</Text>
      <Button title="Login" onPress={() => navigation.replace("Home")} />
    </View>
  );
}