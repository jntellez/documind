import { View, ScrollView, useWindowDimensions } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from 'types';
import { useColorScheme } from 'nativewind';
import { useHeaderHeight } from '@react-navigation/elements';
import DocumentViewer from '@/components/document/DocumentViewer';

type DocumentScreenProps = StackScreenProps<RootStackParamList, 'Document'>;

export default function Document({ route }: DocumentScreenProps) {
  const { data } = route.params;
  const { width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const contentWidth = width - 32;
  const { colorScheme } = useColorScheme();

  const textColor = colorScheme === 'dark' ? 'white' : 'black';
  const borderColor = colorScheme === 'dark' ? '#52525b' : '#ddd';

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: headerHeight }}
      className="flex-1 bg-zinc-100 dark:bg-zinc-900"
      minimumZoomScale={1}
      maximumZoomScale={2}
      bouncesZoom={true}
    >
      <View className="p-4">
        <DocumentViewer
          title={data?.title || 'Document'}
          content={data?.content || null}
          contentWidth={contentWidth}
          textColor={textColor}
          borderColor={borderColor}
        />
      </View>
    </ScrollView>
  );
}