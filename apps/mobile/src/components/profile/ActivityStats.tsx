import { View } from 'react-native';
import Card from '@/components/ui/Card';
import { Title, Paragraph } from '@/components/ui/Typography';

type ActivityStatsProps = {
  documentsCount: number;
};

export default function ActivityStats({ documentsCount }: ActivityStatsProps) {
  return (
    <View className="mb-6">
      <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-70">
        Activity
      </Paragraph>
      <Card className="flex-1 items-center py-6">
        <Title className="text-2xl mt-2">{documentsCount}</Title>
        <Paragraph className="text-xs">Documents</Paragraph>
      </Card>
    </View>
  );
}
