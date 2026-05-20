import { fireEvent, render, waitFor } from "@testing-library/react-native";
import DocumentChat from "./DocumentChat";
import { useDocumentChat } from "./useDocumentChat";

jest.mock("expo-audio", () => ({
  setAudioModeAsync: jest.fn(),
}));

jest.mock("expo-speech", () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

jest.mock("@react-navigation/elements", () => ({
  useHeaderHeight: () => 32,
}));

jest.mock("@/hooks/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

jest.mock("@/theme/useUiTheme", () => ({
  useUiTheme: () => ({
    primary: "#4f46e5",
    mutedForeground: "#6b7280",
  }),
}));

jest.mock("./useDocumentChat", () => ({
  useDocumentChat: jest.fn(),
}));

const { useNetworkStatus } = jest.requireMock("@/hooks/useNetworkStatus") as {
  useNetworkStatus: jest.Mock;
};

const mockedUseDocumentChat = useDocumentChat as jest.MockedFunction<typeof useDocumentChat>;
const navigation = {} as never;
const route = {
  key: "DocumentChat",
  name: "DocumentChat",
  params: { documentId: 7, title: "Algebra" },
} as never;

const baseHookState = {
  chatError: "",
  chatMessage: "",
  contextualSuggestions: ["Summarize Algebra."],
  hasMessages: false,
  historyError: "",
  isChatLoading: false,
  isHistoryLoading: false,
  loadMessages: jest.fn().mockResolvedValue(undefined),
  messages: [],
  setChatMessage: jest.fn(),
  submitMessage: jest.fn().mockResolvedValue(undefined),
};

describe("DocumentChat screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNetworkStatus.mockReturnValue({ isOnline: true, isInternetReachable: true });
    mockedUseDocumentChat.mockReturnValue(baseHookState as never);
  });

  test("renders empty state and loads message history", async () => {
    const screen = render(
      <DocumentChat navigation={navigation} route={route} />,
    );

    expect(screen.getByText("Start the conversation")).toBeTruthy();
    expect(screen.getByText("Summarize Algebra.")).toBeTruthy();

    await waitFor(() => {
      expect(baseHookState.loadMessages).toHaveBeenCalledTimes(1);
    });
  });

  test("shows offline notice when network is unavailable", () => {
    useNetworkStatus.mockReturnValue({ isOnline: false, isInternetReachable: false });

    const screen = render(
      <DocumentChat navigation={navigation} route={route} />,
    );

    expect(
      screen.getByText(
        "Chat is disabled offline and only works for documents already saved on the server.",
      ),
    ).toBeTruthy();
  });

  test("submits suggestion when user taps empty-state action", () => {
    const submitMessage = jest.fn().mockResolvedValue(undefined);
    mockedUseDocumentChat.mockReturnValue({ ...baseHookState, submitMessage } as never);

    const screen = render(
      <DocumentChat navigation={navigation} route={route} />,
    );

    fireEvent.press(screen.getByText("Summarize Algebra."));

    expect(submitMessage).toHaveBeenCalledWith("Summarize Algebra.");
  });

  test("shows history error and retries loading when user taps Try again", () => {
    const loadMessages = jest.fn().mockResolvedValue(undefined);
    mockedUseDocumentChat.mockReturnValue(
      {
        ...baseHookState,
        historyError: "Failed to load chat history.",
        isHistoryLoading: false,
        loadMessages,
      } as never,
    );

    const screen = render(
      <DocumentChat navigation={navigation} route={route} />,
    );

    expect(screen.getByText("Couldn't load the conversation")).toBeTruthy();
    expect(screen.getByText("Failed to load chat history.")).toBeTruthy();

    fireEvent.press(screen.getByText("Try again"));

    expect(loadMessages).toHaveBeenCalledTimes(2);
  });
});
