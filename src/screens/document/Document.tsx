import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from 'types';
import RenderHtml, { HTMLElementModel, HTMLContentModel } from 'react-native-render-html';
import { useColorScheme } from 'nativewind';
import { useHeaderHeight } from '@react-navigation/elements';
import ExternalLink from "@/components/ui/ExternalLink";

type DocumentScreenProps = StackScreenProps<RootStackParamList, 'Document'>;

const customHTMLElementModels = {
  iframe: HTMLElementModel.fromCustomModel({
    tagName: 'iframe',
    mixedUAStyles: {
      width: '100%',
      height: 'auto',
    },
    contentModel: HTMLContentModel.block
  })
};

const renderers = {
  iframe: ({ tnode }: any) => {
    const url = tnode.attributes.src;

    if (!url) return null;
    return <ExternalLink url={url} className="my-2" />;
  }
};

export default function Document({ route }: DocumentScreenProps) {
  const { data } = route.params;
  const { width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const contentWidth = width - 32;
  const { colorScheme } = useColorScheme();

  const textColor = colorScheme === 'dark' ? 'white' : 'black';

  const baseStyle = {
    color: textColor
  };

  const tagsStyles = {
    p: { marginVertical: 12, color: textColor, lineHeight: 22, fontSize: 14 },
    ul: { marginVertical: 12, paddingLeft: 25 },
    li: { color: textColor },
    h2: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, color: textColor },
    h3: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: textColor },
    h4: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: textColor },
    strong: { fontWeight: 'bold' },
    b: { fontWeight: 'bold' },
    em: { fontStyle: 'italic' },
    img: {
      marginVertical: 10
    },
    a: { color: '#1a86f1' }
  };

  return (
    <ScrollView contentContainerStyle={{
      paddingTop: headerHeight
    }}
      className="flex-1 bg-zinc-100 dark:bg-zinc-900"
    >
      <View className="p-4">

        <Text className="text-[24px] font-bold dark:text-white mb-2">
          {data?.title || 'Document'}
        </Text>

        <Text className="text-zinc-500 dark:text-zinc-400 mb-4">
          4-5 minutes
        </Text>

        {data?.content ? (
          <RenderHtml
            contentWidth={contentWidth}
            source={{ html: data.content }}
            baseStyle={baseStyle}
            tagsStyles={tagsStyles}
            customHTMLElementModels={customHTMLElementModels}
            renderers={renderers}
          />
        ) : (
          <Text className="dark:text-white">No content found.</Text>
        )}

      </View>
    </ScrollView>
  );
}