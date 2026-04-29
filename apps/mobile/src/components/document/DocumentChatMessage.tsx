import * as Clipboard from "expo-clipboard";
import type { DocumentChatMessage } from "@documind/types";
import { View } from "react-native";
import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { showToast } from "@/components/ui/Toast";
import { Paragraph } from "@/components/ui/Typography";
import { useState } from "react";

type DocumentChatMessageProps = {
  message: DocumentChatMessage;
};

export default function DocumentChatMessage({ message }: DocumentChatMessageProps) {
  const [isSourcesVisible, setIsSourcesVisible] = useState(false);
  const isUserMessage = message.role === "user";
  const citations = message.citations ?? [];

  async function handleCopy() {
    await Clipboard.setStringAsync(message.content);

    showToast({
      type: "success",
      text1: "Copied",
      text2: "Response copied to clipboard.",
    });
  }

  function handleListen() {
    showToast({
      type: "info",
      text1: "Listen coming soon",
      text2: "Text-to-speech can be added next.",
    });
  }

  if (isUserMessage) {
    return (
      <Card className="self-end max-w-[82%] gap-0 px-4 py-3">
        <Paragraph className="text-lg text-foreground dark:text-dark-foreground">
          {message.content}
        </Paragraph>
      </Card>
    );
  }

  return (
    <View className="w-full py-4">
      <View className="w-full pb-1">
        <Paragraph className="py-2 text-lg text-foreground dark:text-dark-foreground">
          {message.content}
        </Paragraph>
      </View>

      <View className="flex-row flex-wrap items-center gap-1">
        <Button
          tone="ghost"
          size="sm"
          variant="icon-only"
          icon={<Icon library="feather" name="copy" size={17} tone="mutedForeground" />}
          onPress={() => void handleCopy()}
          className="-ml-2"
        />
        <Button
          tone="ghost"
          size="sm"
          variant="icon-only"
          icon={<Icon library="feather" name="volume-2" size={17} tone="mutedForeground" />}
          onPress={handleListen}
        />
        <Button
          tone="ghost"
          size="sm"
          title="Sources"
          onPress={() => setIsSourcesVisible(true)}
        />
      </View>

      <BottomSheet
        visible={isSourcesVisible}
        onClose={() => setIsSourcesVisible(false)}
        title="Sources"
        scrollable
        contentClassName="gap-3"
      >
        {citations.length > 0 ? (
          citations.map((citation) => (
            <Card
              key={`${message.id}-${citation.chunkIndex}-${citation.excerpt}`}
              className="gap-2"
            >
              <Paragraph className="text-xs font-semibold text-foreground dark:text-dark-foreground">
                {`Chunk ${citation.chunkIndex}`}
              </Paragraph>
              <Paragraph className="text-sm text-foreground dark:text-dark-foreground">
                {citation.excerpt}
              </Paragraph>
            </Card>
          ))
        ) : (
          <View className="min-h-70 items-center justify-center">
            <Paragraph>
              No citations were attached to this response.
            </Paragraph>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}
