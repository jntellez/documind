import RenderHtml from 'react-native-render-html';
import WebView from 'react-native-webview';
import { customHTMLElementModels, renderers, getTagsStyles, getTableCss } from '@/config/documentRenderConfig';
import { Text, View } from 'react-native';

interface DocumentViewerProps {
  title: string;
  content: string | null;
  contentWidth: number;
  textColor: string;
  borderColor: string;
  wordCount?: number;
}

function calculateReadTime(wordCount: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export default function DocumentViewer({
  title,
  content,
  contentWidth,
  textColor,
  borderColor,
  wordCount
}: DocumentViewerProps) {
  const baseStyle = { color: textColor };
  const tagsStyles = getTagsStyles(textColor, borderColor);
  const tableCss = getTableCss(textColor, borderColor);

  return (
    <View>
      {/* Header */}
      <View className="mb-4">
        <Text className="text-[24px] font-bold dark:text-white mb-2">
          {title}
        </Text>
        <Text className="text-zinc-500 dark:text-zinc-400">
          {wordCount ? `${wordCount.toLocaleString()} words • ${calculateReadTime(wordCount)}` : "Quick read"}
        </Text>
      </View>

      {/* Content */}
      {content ? (
        <RenderHtml
          contentWidth={contentWidth}
          source={{ html: content }}
          baseStyle={baseStyle}
          tagsStyles={tagsStyles}
          customHTMLElementModels={customHTMLElementModels}
          renderers={renderers}
          WebView={WebView}
          renderersProps={{
            table: {
              animationType: 'none',
              cssRules: tableCss,
              webViewProps: {
                scrollEnabled: false,
                showsHorizontalScrollIndicator: false,
                showsVerticalScrollIndicator: false,
                style: { backgroundColor: 'transparent' }
              }
            }
          }}
        />
      ) : (
        <Text className="dark:text-white">No content found.</Text>
      )}
    </View>
  );
}