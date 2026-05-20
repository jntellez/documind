import { act, renderHook } from "@testing-library/react-native";
import {
  getDocumentChatMessages,
  sendDocumentChatMessage,
} from "@/services/documentService";
import { useDocumentChat } from "./useDocumentChat";

jest.mock("@/services/documentService", () => ({
  getDocumentChatMessages: jest.fn(),
  sendDocumentChatMessage: jest.fn(),
}));

const mockedGetDocumentChatMessages = getDocumentChatMessages as jest.MockedFunction<
  typeof getDocumentChatMessages
>;
const mockedSendDocumentChatMessage = sendDocumentChatMessage as jest.MockedFunction<
  typeof sendDocumentChatMessage
>;

describe("useDocumentChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("exposes base state and contextual suggestions", () => {
    const { result } = renderHook(() =>
      useDocumentChat({ documentId: 7, title: "Algebra", canUseChat: true }),
    );

    expect(result.current.messages).toEqual([]);
    expect(result.current.hasMessages).toBe(false);
    expect(result.current.contextualSuggestions[0]).toBe("Summarize Algebra.");
    expect(result.current.isHistoryLoading).toBe(true);
  });

  test("loads history and reports controlled errors", async () => {
    mockedGetDocumentChatMessages.mockRejectedValueOnce(new Error("Network unavailable"));

    const { result } = renderHook(() =>
      useDocumentChat({ documentId: 3, title: "Biology", canUseChat: true }),
    );

    await act(async () => {
      await result.current.loadMessages();
    });

    expect(result.current.historyError).toBe("Network unavailable");
    expect(result.current.isHistoryLoading).toBe(false);

    mockedGetDocumentChatMessages.mockResolvedValueOnce([
      {
        id: 1,
        document_id: 3,
        user_id: 10,
        role: "assistant",
        content: "Ready to help",
        citations: [],
        created_at: new Date().toISOString(),
      },
    ]);

    await act(async () => {
      await result.current.loadMessages();
    });

    expect(result.current.historyError).toBe("");
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.hasMessages).toBe(true);
  });

  test("handles submit validation and recovers on failed send", async () => {
    mockedSendDocumentChatMessage.mockRejectedValueOnce(new Error("Gateway timeout"));

    const { result } = renderHook(() =>
      useDocumentChat({ documentId: 11, title: "Physics", canUseChat: true }),
    );

    await act(async () => {
      await result.current.submitMessage("   ");
    });

    expect(result.current.chatError).toBe("Enter a question first.");

    await act(async () => {
      await result.current.submitMessage("What should I review first?");
    });

    expect(mockedSendDocumentChatMessage).toHaveBeenCalledWith(
      11,
      "What should I review first?",
    );
    expect(result.current.messages).toEqual([]);
    expect(result.current.chatMessage).toBe("What should I review first?");
    expect(result.current.chatError).toBe("Gateway timeout");
    expect(result.current.isChatLoading).toBe(false);
  });
});
