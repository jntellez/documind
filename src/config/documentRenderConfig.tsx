import { HTMLElementModel, HTMLContentModel } from 'react-native-render-html';
import { tableModel } from '@native-html/table-plugin';
import TableRenderer from '@native-html/table-plugin';
import ExternalLink from "@/components/ui/ExternalLink";

export const customHTMLElementModels = {
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

export const renderers = {
  iframe: ({ tnode }: any) => {
    const url = tnode.attributes.src;
    if (!url) return null;
    return <ExternalLink url={url} className="my-2" />;
  },
  table: TableRenderer,
};

export const getTagsStyles = (textColor: string, borderColor: string) => ({
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
  img: { marginVertical: 10 },
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
});

export const getTableCss = (textColor: string, borderColor: string) => `
  body {
    background-color: transparent;
    color: ${textColor};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 0;
    font-size: 14px;
  }
  table {
    width: 100% !important;
    border-collapse: collapse;
    border: none;
    table-layout: fixed;
  }
  th, td {
    border: 1px solid ${borderColor};
    padding: 12px 8px;
    text-align: left;
    word-wrap: break-word;
  }
  th {
    font-weight: 700;
  }
  a {
    color: #1a86f1;
    text-decoration: none;
  }
`;