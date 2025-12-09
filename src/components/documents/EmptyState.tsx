import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from 'nativewind';
import Card from '../ui/Card';
import { Paragraph, Title } from '../ui/Typography';

export default function EmptyState() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Card className="w-24 h-24 items-center justify-center rounded-full mb-6">
        <Ionicons
          name="document-text-outline"
          size={48}
          color={isDark ? '#aaa' : '#666'}
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