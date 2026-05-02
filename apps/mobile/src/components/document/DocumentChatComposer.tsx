import { View } from "react-native";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import { Paragraph } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";

type DocumentChatComposerProps = {
  canUseChat: boolean;
  chatError: string;
  chatMessage: string;
  isChatLoading: boolean;
  isInputFocused: boolean;
  onBlur: () => void;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onSubmit: () => void;
};

export default function DocumentChatComposer({
  canUseChat,
  chatError,
  chatMessage,
  isChatLoading,
  isInputFocused,
  onBlur,
  onChangeText,
  onFocus,
  onSubmit,
}: DocumentChatComposerProps) {
  return (
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
          onChangeText={onChangeText}
          editable={!isChatLoading && canUseChat}
          multiline
          textAlignVertical="top"
          onFocus={onFocus}
          onBlur={onBlur}
        />

        <Button
          variant="icon-only"
          tone="primary"
          onPress={onSubmit}
          disabled={!canUseChat || !chatMessage.trim() || isChatLoading}
          loading={isChatLoading}
          icon={<Icon library="feather" name="arrow-up" size="md" tone="muted" />}
          className="size-12 absolute right-2 top-2 items-center justify-center"
        />
      </View>
    </View>
  );
}
