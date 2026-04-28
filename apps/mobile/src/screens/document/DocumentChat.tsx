import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import type { DocumentChatMessage } from "@documind/types";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import Button from "@/components/ui/Button";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { Paragraph, Title } from "@/components/ui/Typography";
import {
  getDocumentChatMessages,
  sendDocumentChatMessage,
} from "@/services/documentService";
import { useUiTheme } from "@/theme/useUiTheme";
import type { DocumentChatScreenProps } from "types";

export default function DocumentChat({ route, navigation }: DocumentChatScreenProps) {
  const { documentId, title } = route.params;
  const headerHeight = useHeaderHeight();
  const { isOnline, isInternetReachable } = useNetworkStatus();
  const theme = useUiTheme();
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<DocumentChatMessage[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [chatError, setChatError] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const canUseChat = isOnline && isInternetReachable;

  useEffect(() => {
    let isMounted = true;

    if (!canUseChat) {
      setIsHistoryLoading(false);
      setHistoryError("");
      return () => {
        isMounted = false;
      };
    }

    async function loadMessages() {
      setIsHistoryLoading(true);
      setHistoryError("");

      try {
        const response = await getDocumentChatMessages(documentId);

        if (isMounted) {
          setMessages(response);
        }
      } catch (error: any) {
        if (isMounted) {
          setHistoryError(error.message || "Failed to load chat history.");
        }
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    }

    void loadMessages();

    return () => {
      isMounted = false;
    };
  }, [canUseChat, documentId]);

  async function handleChatSubmit() {
    const trimmedMessage = chatMessage.trim();

    if (!canUseChat) {
      return;
    }

    if (!trimmedMessage) {
      setChatError("Enter a question first.");
      return;
    }

    setIsChatLoading(true);
    setChatError("");

    try {
      const response = await sendDocumentChatMessage(documentId, trimmedMessage);
      const now = new Date().toISOString();

      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          document_id: documentId,
          user_id: 0,
          role: "user",
          content: trimmedMessage,
          citations: null,
          created_at: now,
        },
        {
          id: Date.now() + 1,
          document_id: documentId,
          user_id: 0,
          role: "assistant",
          content: response.answer,
          citations: response.citations ?? [],
          created_at: new Date().toISOString(),
        },
      ]);
      setChatMessage("");
    } catch (error: any) {
      setChatError(error.message || "Failed to get an answer for this document.");
    } finally {
      setIsChatLoading(false);
    }
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4 px-4">
          <View className="gap-2">
            <Title>Ask AI</Title>
            <Paragraph>
              Get a concise answer grounded only in {title}.
            </Paragraph>
          </View>

          <View className="gap-3">
            <Title className="text-lg">History</Title>

            {isHistoryLoading ? (
              <View className="flex-row items-center gap-3 rounded-3xl border border-border dark:border-dark-border px-4 py-4">
                <ActivityIndicator color={theme.primary} />
                <Paragraph>Loading chat history…</Paragraph>
              </View>
            ) : null}

            {historyError ? (
              <Paragraph className="text-destructive dark:text-dark-destructive">
                {historyError}
              </Paragraph>
            ) : null}

            {!isHistoryLoading && !historyError && messages.length === 0 ? (
              <View className="rounded-3xl border border-border dark:border-dark-border px-4 py-4">
                <Paragraph>No messages yet. Ask your first question about this document.</Paragraph>
              </View>
            ) : null}

            {messages.map((message) => {
              const isUserMessage = message.role === "user";

              return (
                <View
                  key={`${message.id}-${message.created_at}`}
                  className={`gap-2 rounded-3xl px-4 py-4 ${
                    isUserMessage
                      ? "border border-primary bg-primary/10 dark:border-dark-primary"
                      : "border border-border dark:border-dark-border"
                  }`}
                >
                  <Paragraph className="font-semibold text-foreground dark:text-dark-foreground">
                    {isUserMessage ? "You" : "Assistant"}
                  </Paragraph>
                  <Paragraph className="text-foreground dark:text-dark-foreground">
                    {message.content}
                  </Paragraph>
                  {!isUserMessage && message.citations && message.citations.length > 0 ? (
                    <View className="gap-1 rounded-2xl bg-surface-glass dark:bg-dark-surface-glass px-3 py-2">
                      <Paragraph className="text-xs font-semibold text-muted-foreground dark:text-dark-muted-foreground">
                        Sources
                      </Paragraph>
                      {message.citations.map((citation) => (
                        <Paragraph
                          key={`${message.id}-${citation.chunkIndex}-${citation.excerpt}`}
                          className="text-xs text-muted-foreground dark:text-dark-muted-foreground"
                        >
                          {`Chunk ${citation.chunkIndex}: ${citation.excerpt}`}
                        </Paragraph>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          <View className="rounded-3xl border border-input-border dark:border-dark-input-border bg-surface-glass dark:bg-dark-surface-glass px-4 py-3">
            <TextInput
              value={chatMessage}
              onChangeText={setChatMessage}
              editable={!isChatLoading && canUseChat}
              placeholder="Ask a question about this document"
              placeholderTextColor={theme.placeholder}
              cursorColor={theme.cursor}
              multiline
              textAlignVertical="top"
              className="min-h-[120px] text-foreground dark:text-dark-foreground"
            />
          </View>

          {!canUseChat ? (
            <Paragraph>
              Chat is disabled offline and only works for documents already saved on the server.
            </Paragraph>
          ) : null}

          {chatError ? (
            <Paragraph className="text-destructive dark:text-dark-destructive">
              {chatError}
            </Paragraph>
          ) : null}

          {isChatLoading ? (
            <View className="flex-row items-center gap-3 rounded-3xl border border-border dark:border-dark-border px-4 py-4">
              <ActivityIndicator color={theme.primary} />
              <Paragraph>Thinking…</Paragraph>
            </View>
          ) : null}

          <View className="flex-row justify-end gap-3">
            <Button
              title="Back"
              onPress={() => navigation.goBack()}
              disabled={isChatLoading}
            />
            <Button
              title="Ask"
              tone="primary"
              onPress={handleChatSubmit}
              disabled={!canUseChat || !chatMessage.trim() || isChatLoading}
              loading={isChatLoading}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
