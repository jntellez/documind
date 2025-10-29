import { Text, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "@/../types";

type LoginScreenNavigationProp = StackScreenProps<RootStackParamList, "Login">;
interface LoginScreenProps extends LoginScreenNavigationProp { }

export default function Login({ navigation }: LoginScreenProps) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text className="color-red-700">Login Screen</Text>
    </View>
  );
}