import RenderHtml from 'react-native-render-html';
import WebView from 'react-native-webview';
import { customHTMLElementModels, renderers, getTagsStyles, getTableCss } from '@/config/documentRenderConfig';
import { Text, View } from 'react-native';
import { useUiTheme } from '@/theme/useUiTheme';
import { Paragraph, Title } from '../ui/Typography';

interface DocumentViewerProps {
  title: string;
  content: string | null;
  contentWidth: number;
  wordCount?: number;
  showImages: boolean;
  contentFontSize: "small" | "medium" | "large";
}

const DOCUMENT_CONTENT_FONT_SIZE: Record<"small" | "medium" | "large", number> = {
  small: 12,
  medium: 14,
  large: 18,
};

function calculateReadTime(wordCount: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export default function DocumentViewer({
  title,
  content,
  contentWidth,
  wordCount,
  showImages,
  contentFontSize,
}: DocumentViewerProps) {
  const theme = useUiTheme();
  const textColor = theme.foreground;
  const borderColor = theme.mutedForeground;
  const baseFontSize = DOCUMENT_CONTENT_FONT_SIZE[contentFontSize];
  const baseStyle = { color: textColor, fontSize: baseFontSize };
  const tagsStyles = getTagsStyles(textColor, borderColor, baseFontSize);
  const tableCss = getTableCss(textColor, borderColor, baseFontSize);

  return (
    <View>
      {/* Header */}
      <View className="mb-4">
        <Title className="text-[24px] font-bold mb-2">
          {title}
        </Title>
        <Paragraph>
          {wordCount ? `${wordCount.toLocaleString()} words • ${calculateReadTime(wordCount)}` : "Quick read"}
        </Paragraph>
      </View>

      {/* Content */}
      {content ? (
        <RenderHtml
          contentWidth={contentWidth}
          source={{ html: content }}
          baseStyle={baseStyle}
          tagsStyles={tagsStyles}
          ignoredDomTags={showImages ? ['svg'] : ['svg', 'img']}
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
        <Paragraph>No content found.</Paragraph>
      )}
    </View>
  );
}
