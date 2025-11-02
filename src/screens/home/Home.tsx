import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/../types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';

type HomeScreenNavigationProp = StackScreenProps<RootStackParamList, 'Home'>;
interface HomeScreenProps extends HomeScreenNavigationProp { }

export default function Home({ navigation }: HomeScreenProps) {
  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">

        <View className="flex-row items-center bg-white rounded-xl shadow-md p-2 mt-4 mx-4">
          <TextInput
            placeholder="Enter a url"
            className="flex-1 text-base p-2"
          />
          <TouchableOpacity className="flex justify-center items-center bg-gray-200 rounded-full w-10 h-10 p-2 ml-2">
            <FontAwesome6 name="add" size={20} color="black" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center bg-white rounded-xl shadow-md p-8 m-4 mt-6 min-h-[250px]">
          <Ionicons name="tablet-portrait" size={64} color="#a5a7ad" />
          <Text className="text-gray-500 text-lg mt-4">Recent documents is empty</Text>
        </View>

      </ScrollView>
    </View>
  );
}