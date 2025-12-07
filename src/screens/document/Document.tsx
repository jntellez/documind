import { View, ScrollView, useWindowDimensions, Text } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from 'types';
import { useColorScheme } from 'nativewind';
import { useHeaderHeight } from '@react-navigation/elements';
import DocumentViewer from '@/components/document/DocumentViewer';
import Button from "@/components/ui/Button";
import { saveDocument } from "@/services/documentService";

type DocumentScreenProps = StackScreenProps<RootStackParamList, 'Document'>;

export default function Document({ route }: DocumentScreenProps) {
  const { data } = route.params;
  const { width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const contentWidth = width - 32;
  const { colorScheme } = useColorScheme();

  const textColor = colorScheme === 'dark' ? 'white' : 'black';
  const borderColor = colorScheme === 'dark' ? '#52525b' : '#ddd';

  function handleSave() {
    if (data) {
      saveDocument(data);
    }
  }

  if (!data) {
    return (
      <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 items-center justify-center p-4">
        <Text className="text-zinc-900 dark:text-zinc-100 text-lg">
          No document data available
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900">
      <ScrollView
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 80 }}
        className="flex-1"
        minimumZoomScale={1}
        maximumZoomScale={2}
        bouncesZoom={true}
      >
        <View className="p-4">
          <DocumentViewer
            title={data.title}
            content={data.content}
            contentWidth={contentWidth}
            textColor={textColor}
            borderColor={borderColor}
          />
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 transparent">
        <Button onPress={handleSave} title="Save Document" />
      </View>
    </View>
  );
}