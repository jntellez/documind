import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import type { DocumentChatMessage } from "@documind/types";
import { BlurView as ExpoBlurView } from "expo-blur";
import { styled } from "nativewind";
import DocumentChatMessageItem from "@/components/document/DocumentChatMessage";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { Paragraph, Title } from "@/components/ui/Typography";
import {
  getDocumentChatMessages,
  sendDocumentChatMessage,
} from "@/services/documentService";
import { useUiTheme } from "@/theme/useUiTheme";
import { cn } from "@/lib/cn";
import type { DocumentChatScreenProps } from "types";
import Card from "@/components/ui/Card";

const StyledBlurView = styled(ExpoBlurView);

const SUGGESTED_PROMPTS = [
  "Give me a quick summary.",
  "What are the main takeaways?",
  "What should I review first?",
];

export default function DocumentChat({ route }: DocumentChatScreenProps) {
  const { documentId, title } = route.params;
  const headerHeight = useHeaderHeight();
  const { isOnline, isInternetReachable } = useNetworkStatus();
  const theme = useUiTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<DocumentChatMessage[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [chatError, setChatError] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const canUseChat = isOnline && isInternetReachable;
  const hasMessages = messages.length > 0;
  const keyboardOffset = Platform.OS === "ios" ? 0 : 0;
  const contextualSuggestions = useMemo(
    () => [
      `Summarize ${title}.`,
      ...SUGGESTED_PROMPTS,
    ],
    [title],
  );

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!canUseChat) {
      setIsHistoryLoading(false);
      setHistoryError("");
      return;
    }

    setIsHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await getDocumentChatMessages(documentId);
      setMessages(response);
    } catch (error: any) {
      setHistoryError(error.message || "Failed to load chat history.");
    } finally {
      setIsHistoryLoading(false);
    }
  }, [canUseChat, documentId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (hasMessages || isChatLoading) {
      scrollToBottom(hasMessages);
    }
  }, [hasMessages, isChatLoading, messages, scrollToBottom]);

  async function handleChatSubmit(messageOverride?: string) {
    const trimmedMessage = (messageOverride ?? chatMessage).trim();

    if (!canUseChat) {
      return;
    }

    if (!trimmedMessage) {
      setChatError("Enter a question first.");
      return;
    }

    setIsChatLoading(true);
    setChatError("");
    setChatMessage("");

    const optimisticUserMessage: DocumentChatMessage = {
      id: Date.now(),
      document_id: documentId,
      user_id: 0,
      role: "user",
      content: trimmedMessage,
      citations: null,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticUserMessage]);

    try {
      const response = await sendDocumentChatMessage(documentId, trimmedMessage);

      setMessages((current) => [
        ...current,
        {
          id: optimisticUserMessage.id + 1,
          document_id: documentId,
          user_id: 0,
          role: "assistant",
          content: response.answer,
          citations: response.citations ?? [],
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error: any) {
      setMessages((current) =>
        current.filter((message) => message.id !== optimisticUserMessage.id),
      );
      setChatMessage(trimmedMessage);
      setChatError(error.message || "Failed to get an answer for this document.");
    } finally {
      setIsChatLoading(false);
    }
  }

  return (
    <ScreenContainer className="px-0 pb-0">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View className="flex-1">
          {!canUseChat && (
            <View className="px-4 pb-2" style={{ paddingTop: headerHeight + 8 }}>
              <Card className="flex-row items-center gap-3">
                <Icon library="feather" name="info" size="lg" tone="warning" />
                <Paragraph className="text-sm">
                  Chat is disabled offline and only works for documents already saved on the server.
                </Paragraph>
              </Card>
            </View>
          )}

          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: canUseChat ? headerHeight + 8 : 8,
              paddingHorizontal: 16,
              gap: 12,
            }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (hasMessages || isChatLoading) {
                scrollToBottom();
              }
            }}
          >
            {isHistoryLoading && (
              <View className="flex-1 justify-center">
                <View className="flex-row items-center gap-3 rounded-[28px] border border-border px-4 py-4 dark:border-dark-border">
                  <ActivityIndicator color={theme.mutedForeground} />
                  <Paragraph>Loading chat history…</Paragraph>
                </View>
              </View>
            )}

            {!isHistoryLoading && historyError && (
              <Card className="border-destructive/30 py-6 dark:border-dark-destructive/40">
                <View className="gap-1">
                  <Title className="text-xl text-center">Couldn&apos;t load the conversation</Title>
                  <Paragraph className="text-destructive dark:text-dark-destructive text-center">
                    {historyError || 'Error al cargar el chat. Please check your connection and try again.'}
                  </Paragraph>
                </View>

                <Button
                  className="self-center"
                  title="Try again"
                  onPress={() => void loadMessages()}
                  disabled={!canUseChat}
                />
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
                      onPress={() => void handleChatSubmit(suggestion)}
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
                  <DocumentChatMessageItem
                    key={`${message.id}-${message.created_at}`}
                    message={message}
                  />
                ))}

                {isChatLoading && (
                  <Card className="flex-row self-start gap-2">
                    <ActivityIndicator color={theme.primary} />
                    <Paragraph className="text-foreground dark:text-dark-foreground">
                      Thinking
                    </Paragraph>
                  </Card>
                )}
              </View>
            )}

            {!isHistoryLoading && !historyError && !hasMessages && isChatLoading && (
              <Card className="flex-row self-start gap-2">
                <ActivityIndicator color={theme.primary} />
                <Paragraph className="text-foreground dark:text-dark-foreground">
                  Thinking
                </Paragraph>
              </Card>
            )}

            <View className="h-36" />
          </ScrollView>

          <View
            className={cn(
              "absolute left-0 bottom-0 right-0 overflow-hidden px-4 pt-3",
              isInputFocused ? "pb-4" : "pb-10",
            )}
          >

            {chatError && (
              <Paragraph className="mb-3 text-destructive dark:text-dark-destructive">
                {chatError}
              </Paragraph>
            )}

            <View className="relative">
              <Input
                placeholder="Ask a question about this document"
                className="max-h-[140px] min-h-15.5 p-5 pr-16"
                value={chatMessage}
                onChangeText={setChatMessage}
                editable={!isChatLoading && canUseChat}
                multiline
                textAlignVertical="top"
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />

              <Button
                variant="icon-only"
                tone="primary"
                onPress={() => void handleChatSubmit()}
                disabled={!canUseChat || !chatMessage.trim() || isChatLoading}
                loading={isChatLoading}
                icon={<Icon library="feather" name="arrow-up" size="md" tone="muted" />}
                className="size-12 absolute right-2 top-2 items-center justify-center"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
