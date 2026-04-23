import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from '../ui/Card';
import { Paragraph, Title } from '../ui/Typography';
import { useUiTheme } from '@/theme/useUiTheme';

export default function EmptyState() {
  const theme = useUiTheme();

  return (
    <View className="flex-1 items-center justify-center px-6 mb-18">
      <Card className="size-24 items-center justify-center rounded-full mb-6">
        <Ionicons
          name="document-text-outline"
          size={48}
          color={theme.mutedForeground}
        />
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