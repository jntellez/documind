import { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import DocumentChatComposer from "@/components/document/DocumentChatComposer";
import DocumentChatContent from "@/components/document/DocumentChatContent";
import DocumentChatOfflineNotice from "@/components/document/DocumentChatOfflineNotice";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { useUiTheme } from "@/theme/useUiTheme";
import type { DocumentChatScreenProps } from "types";
import { useDocumentChat } from "./useDocumentChat";


export default function DocumentChat({ route }: DocumentChatScreenProps) {
  const { documentId, title } = route.params;
  const headerHeight = useHeaderHeight();
  const { isOnline, isInternetReachable } = useNetworkStatus();
  const theme = useUiTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const canUseChat = isOnline && isInternetReachable;
  const keyboardOffset = Platform.OS === "ios" ? 0 : 0;
  const {
    chatError,
    chatMessage,
    contextualSuggestions,
    hasMessages,
    historyError,
    isChatLoading,
    isHistoryLoading,
    loadMessages,
    messages,
    setChatMessage,
    submitMessage,
  } = useDocumentChat({ documentId, title, canUseChat });

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (hasMessages || isChatLoading) {
      scrollToBottom(hasMessages);
    }
  }, [hasMessages, isChatLoading, messages, scrollToBottom]);

  return (
    <ScreenContainer className="px-0 pb-0">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View className="flex-1">
          {!canUseChat && <DocumentChatOfflineNotice headerHeight={headerHeight} />}

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
            <DocumentChatContent
              canUseChat={canUseChat}
              contextualSuggestions={contextualSuggestions}
              hasMessages={hasMessages}
              historyError={historyError}
              isChatLoading={isChatLoading}
              isHistoryLoading={isHistoryLoading}
              messages={messages}
              onRetryLoad={() => void loadMessages()}
              onSuggestionPress={(suggestion) => void submitMessage(suggestion)}
              primaryColor={theme.primary}
              mutedForegroundColor={theme.mutedForeground}
            />
          </ScrollView>

          <DocumentChatComposer
            canUseChat={canUseChat}
            chatError={chatError}
            chatMessage={chatMessage}
            isChatLoading={isChatLoading}
            isInputFocused={isInputFocused}
            onBlur={() => setIsInputFocused(false)}
            onChangeText={setChatMessage}
            onFocus={() => setIsInputFocused(true)}
            onSubmit={() => void submitMessage()}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
