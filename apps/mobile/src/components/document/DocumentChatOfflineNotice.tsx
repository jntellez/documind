import { View } from "react-native";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { Paragraph } from "@/components/ui/Typography";

type DocumentChatOfflineNoticeProps = {
  headerHeight: number;
};

export default function DocumentChatOfflineNotice({
  headerHeight,
}: DocumentChatOfflineNoticeProps) {
  return (
    <View className="px-4 pb-2" style={{ paddingTop: headerHeight + 8 }}>
      <Card className="flex-row items-center gap-3">
        <Icon library="feather" name="info" size="lg" tone="warning" />
        <Paragraph className="text-sm">
          Chat is disabled offline and only works for documents already saved on the server.
        </Paragraph>
      </Card>
    </View>
  );
}
