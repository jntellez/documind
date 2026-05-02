import { ActivityIndicator, View } from "react-native";
import type { DocumentChatMessage as DocumentChatMessageType } from "@documind/types";
import DocumentChatMessageItem from "@/components/document/DocumentChatMessage";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Paragraph, Title } from "@/components/ui/Typography";

type DocumentChatContentProps = {
  canUseChat: boolean;
  contextualSuggestions: string[];
  hasMessages: boolean;
  historyError: string;
  isChatLoading: boolean;
  isHistoryLoading: boolean;
  messages: DocumentChatMessageType[];
  onRetryLoad: () => void;
  onSuggestionPress: (suggestion: string) => void;
  primaryColor: string;
  mutedForegroundColor: string;
};

function ThinkingBubble({ color }: { color: string }) {
  return (
    <Card className="flex-row self-start gap-2">
      <ActivityIndicator color={color} />
      <Paragraph className="text-foreground dark:text-dark-foreground">Thinking</Paragraph>
    </Card>
  );
}

export default function DocumentChatContent({
  canUseChat,
  contextualSuggestions,
  hasMessages,
  historyError,
  isChatLoading,
  isHistoryLoading,
  messages,
  mutedForegroundColor,
  onRetryLoad,
  onSuggestionPress,
  primaryColor,
}: DocumentChatContentProps) {
  return (
    <>
      {isHistoryLoading && (
        <View className="flex-1 justify-center">
          <View className="flex-row items-center gap-3 rounded-[28px] border border-border px-4 py-4 dark:border-dark-border">
            <ActivityIndicator color={mutedForegroundColor} />
            <Paragraph>Loading chat history…</Paragraph>
          </View>
        </View>
      )}

      {!isHistoryLoading && historyError && (
        <Card className="border-destructive/30 py-6 dark:border-dark-destructive/40">
          <View className="gap-1">
            <Title className="text-xl text-center">Couldn&apos;t load the conversation</Title>
            <Paragraph className="text-destructive dark:text-dark-destructive text-center">
              {historyError || "Error al cargar el chat. Please check your connection and try again."}
            </Paragraph>
          </View>

          <Button className="self-center" title="Try again" onPress={onRetryLoad} disabled={!canUseChat} />
        </Card>
      )}

      {!isHistoryLoading && !historyError && !hasMessages && (
        <View className="flex-1 justify-center gap-5 pl-2">
          <View className="gap-4">
            <Title className="text-3xl">Start the conversation</Title>
            <Paragraph className="text-lg">
              Ask for a summary, key ideas, or a quick explanation from this document.
            </Paragraph>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {contextualSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                title={suggestion}
                onPress={() => onSuggestionPress(suggestion)}
                disabled={!canUseChat || isChatLoading}
                size="md"
              />
            ))}
          </View>
        </View>
      )}

      {!isHistoryLoading && !historyError && hasMessages && (
        <View className="gap-3 pb-2">
          {messages.map((message) => (
            <DocumentChatMessageItem key={`${message.id}-${message.created_at}`} message={message} />
          ))}

          {isChatLoading && <ThinkingBubble color={primaryColor} />}
        </View>
      )}

      {!isHistoryLoading && !historyError && !hasMessages && isChatLoading && (
        <ThinkingBubble color={primaryColor} />
      )}

      <View className="h-36" />
    </>
  );
}
