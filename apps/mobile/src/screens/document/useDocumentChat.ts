import { useCallback, useMemo, useState } from "react";
import type { DocumentChatMessage } from "@documind/types";
import {
  getDocumentChatMessages,
  sendDocumentChatMessage,
} from "@/services/documentService";

const SUGGESTED_PROMPTS = [
  "Give me a quick summary.",
  "What are the main takeaways?",
  "What should I review first?",
];

type UseDocumentChatParams = {
  documentId: number;
  title: string;
  canUseChat: boolean;
};

export function useDocumentChat({ documentId, title, canUseChat }: UseDocumentChatParams) {
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<DocumentChatMessage[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [chatError, setChatError] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const hasMessages = messages.length > 0;
  const contextualSuggestions = useMemo(
    () => [`Summarize ${title}.`, ...SUGGESTED_PROMPTS],
    [title],
  );

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

  const submitMessage = useCallback(
    async (messageOverride?: string) => {
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
    },
    [canUseChat, chatMessage, documentId],
  );

  return {
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
  };
}
