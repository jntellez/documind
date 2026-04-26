import { View } from 'react-native';
import Card from '../ui/Card';
import Icon from '../ui/Icon';
import { Paragraph, Title } from '../ui/Typography';

export default function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-6 mb-18">
      <Card className="size-24 items-center justify-center rounded-full mb-6">
        <Icon library="ionicons" name="document-text-outline" size={48} tone="muted" />
      </Card>
      <Title className="mb-2">
        No documents yet
      </Title>
      <Paragraph className="text-center">
        Start by processing a URL or uploading a document from the Home screen
      </Paragraph>
    </View>
  );
}
