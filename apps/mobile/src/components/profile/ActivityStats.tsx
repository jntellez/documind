import { View } from 'react-native';
import Card from '@/components/ui/Card';
import { Title, Paragraph } from '@/components/ui/Typography';
import type { UsageEntry } from '@/utils/usage';

type ActivityStatsProps = {
  documentsCount: number;
  documentsLimit?: number;
  processingUsage: UsageEntry;
  chatUsage: UsageEntry;
};

type StatItemProps = {
  label: string;
  value: string;
};

function StatItem({ label, value }: StatItemProps) {
  return (
    <View className="flex-1 items-center justify-center gap-1">
      <Title className="text-xl">{value}</Title>
      <Paragraph className="text-xs opacity-80 text-center">{label}</Paragraph>
    </View>
  );
}

export default function ActivityStats({
  documentsCount,
  documentsLimit = 30,
  processingUsage,
  chatUsage,
}: ActivityStatsProps) {
  return (
    <View className="mb-6">
      <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-70">
        Activity
      </Paragraph>
      <Card className="py-8 px-4">
        <View className="flex-row items-start justify-between gap-2">
          <StatItem label="Processing" value={`${processingUsage.count}/${processingUsage.limit}`} />
          <StatItem label="Documents" value={`${documentsCount}/${documentsLimit}`} />
          <StatItem label="AI Chat" value={`${chatUsage.count}/${chatUsage.limit}`} />
        </View>
      </Card>
    </View>
  );
}
