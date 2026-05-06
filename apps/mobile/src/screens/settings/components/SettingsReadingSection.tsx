import { Pressable, View } from "react-native";
import { useState } from "react";
import ExpandableCard, { ExpandableChevronButton } from "@/components/ui/ExpandableCard";
import Icon from "@/components/ui/Icon";
import { Paragraph } from "@/components/ui/Typography";
import { SettingsActionRow } from "./SettingsActionRow";
import { SettingsSection } from "./SettingsSection";

export type DocumentContentFontSize = "small" | "medium" | "large";

const FONT_SIZE_LABELS: Record<DocumentContentFontSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

const FONT_SIZE_OPTIONS: DocumentContentFontSize[] = ["small", "medium", "large"];

export function SettingsReadingSection({
  showImagesInDetail,
  onToggleShowImagesInDetail,
  documentContentFontSize,
  onChangeDocumentContentFontSize,
}: {
  showImagesInDetail: boolean;
  onToggleShowImagesInDetail: () => void;
  documentContentFontSize: DocumentContentFontSize;
  onChangeDocumentContentFontSize: (value: DocumentContentFontSize) => void;
}) {
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);

  return (
    <SettingsSection title="Reading">
      <SettingsActionRow
        icon={showImagesInDetail ? "eye-outline" : "eye-off-outline"}
        title="Document images"
        description={showImagesInDetail ? "Shown in detail view" : "Hidden in detail view"}
        onPress={onToggleShowImagesInDetail}
      />
      <View className="mt-3">
        <ExpandableCard
          isExpanded={isFontSizeOpen}
          headerClassName="p-4"
          contentClassName="px-4"
          renderHeader={({ toggleExpanded, chevronRotationStyle }) => (
            <Pressable
              onPress={toggleExpanded}
              className="flex-row items-center justify-between p-4 active:opacity-70"
            >
              <View className="flex-row items-center flex-1">
                <View className="size-10 rounded-full border shadow-md border-border dark:border-dark-border items-center justify-center mr-3">
                  <Icon library="ionicons" name="text-outline" size="lg" />
                </View>
                <View className="flex-1">
                  <Paragraph className="font-semibold text-foreground dark:text-dark-foreground mb-0.5">
                    Document content font size
                  </Paragraph>
                  <Paragraph className="text-sm">{FONT_SIZE_LABELS[documentContentFontSize]}</Paragraph>
                </View>
              </View>
              <ExpandableChevronButton
                onPress={(event) => {
                  if (event && typeof event === "object" && "stopPropagation" in event) {
                    (event as { stopPropagation: () => void }).stopPropagation();
                  }
                  toggleExpanded();
                }}
                rotationStyle={chevronRotationStyle}
                className="mt-0"
              />
            </Pressable>
          )}
          expandedContent={(
            <View>
              {FONT_SIZE_OPTIONS.map((fontSize) => {
                const isSelected = fontSize === documentContentFontSize;

                return (
                  <Pressable
                    key={fontSize}
                    onPress={() => {
                      onChangeDocumentContentFontSize(fontSize);
                      setIsFontSizeOpen(false);
                    }}
                    className="flex-row items-center justify-between px-4 py-3 active:opacity-70"
                  >
                    <Paragraph className="font-medium text-foreground dark:text-dark-foreground">
                      {FONT_SIZE_LABELS[fontSize]}
                    </Paragraph>
                    {isSelected && <Icon library="feather" name="check" size="md" tone="primary" />}
                  </Pressable>
                );
              })}
            </View>
          )}
          onExpandedChange={setIsFontSizeOpen}
        />
      </View>
    </SettingsSection>
  );
}
