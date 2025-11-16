import { View, Text } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from 'types';

type DocumentScreenProps = StackScreenProps<RootStackParamList, 'Document'>;

export default function Document({ route }: DocumentScreenProps) {
  const { url, data } = route.params;

  return (
    <View className="flex-1 p-4 bg-zinc-100 dark:bg-zinc-900">
      <Text className="text-lg font-bold dark:text-white">Document Detail</Text>
      <Text className="dark:text-white mt-4">URL: {url}</Text>
      {data && <Text className="dark:text-white">Data: {JSON.stringify(data)}</Text>}
    </View>
  );
}