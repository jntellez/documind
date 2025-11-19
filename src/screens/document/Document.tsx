import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from 'types';
import RenderHtml, { HTMLElementModel, HTMLContentModel } from 'react-native-render-html';
import { useColorScheme } from 'nativewind';
import { useHeaderHeight } from '@react-navigation/elements';
import ExternalLink from "@/components/ui/ExternalLink";
import TableRenderer, { tableModel } from '@native-html/table-plugin';
import WebView from 'react-native-webview';

type DocumentScreenProps = StackScreenProps<RootStackParamList, 'Document'>;

const customHTMLElementModels = {
  iframe: HTMLElementModel.fromCustomModel({
    tagName: 'iframe',
    mixedUAStyles: {
      width: '100%',
      height: 'auto',
    },
    contentModel: HTMLContentModel.block
  }),
  table: tableModel,
};

const renderers = {
  iframe: ({ tnode }: any) => {
    const url = tnode.attributes.src;

    if (!url) return null;
    return <ExternalLink url={url} className="my-2" />;
  },
  table: TableRenderer,
};

export default function Document({ route }: DocumentScreenProps) {
  const { data } = route.params;
  const { width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const contentWidth = width - 32;
  const { colorScheme } = useColorScheme();

  const textColor = colorScheme === 'dark' ? 'white' : 'black';
  const borderColor = colorScheme === 'dark' ? '#52525b' : '#ddd';

  const tableCss = `
    body {
      background-color: transparent;
      color: ${textColor};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      font-size: 14px; /* Mismo tamaño que tu párrafo */
    }
    table {
      width: 100% !important;
      border-collapse: collapse;
      border: none;
      table-layout: fixed; /* Fuerza a la tabla a ajustarse al ancho */
    }
    th, td {
      border: 1px solid ${borderColor};
      padding: 12px 8px;
      text-align: left;
      word-wrap: break-word; /* Rompe palabras largas para evitar scroll */
    }
    th {
      font-weight: 700;
    }
    a {
      color: #1a86f1;
      text-decoration: none;
    }
  `;

  const baseStyle = {
    color: textColor
  };

  const tagsStyles = {
    p: { marginVertical: 12, color: textColor, lineHeight: 22, fontSize: 14 },
    ul: { marginVertical: 12, paddingLeft: 25 },
    ol: { marginVertical: 12, paddingLeft: 25 },
    li: { color: textColor, marginBottom: 8 },
    h2: { fontSize: 20, fontWeight: '700' as const, marginVertical: 10, color: textColor },
    h3: { fontSize: 18, fontWeight: '700' as const, marginVertical: 10, color: textColor },
    h4: { fontSize: 18, fontWeight: '700' as const, marginVertical: 10, color: textColor },
    strong: { fontWeight: '700' as const },
    b: { fontWeight: '700' as const },
    em: { fontStyle: 'italic' as const },
    img: {
      marginVertical: 10
    },
    a: { color: '#1a86f1' },
    table: {
      marginVertical: 16,
      borderWidth: 1,
      borderColor: borderColor,
    },
    th: {
      borderWidth: 1,
      borderColor: borderColor,
      padding: 8,
      fontWeight: '700' as const,
      color: textColor,
      textAlign: 'center' as const,
    },
    td: {
      borderWidth: 1,
      borderColor: borderColor,
      padding: 8,
      color: textColor,
    },
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
            WebView={WebView}
            renderersProps={{
              table: {
                animationType: 'none',
                // 2. INYECTAMOS EL CSS
                cssRules: tableCss,

                // 3. CONFIGURAMOS EL WEBVIEW PARA NO TENER SCROLL
                webViewProps: {
                  scrollEnabled: false, // Desactiva el scroll del dedo
                  showsHorizontalScrollIndicator: false,
                  showsVerticalScrollIndicator: false,
                  // Hacemos el fondo transparente para que coincida con el tema
                  style: { backgroundColor: 'transparent' }
                }
              }
            }}
          />
        ) : (
          <Text className="dark:text-white">No content found.</Text>
        )}

      </View>
    </ScrollView>
  );
}