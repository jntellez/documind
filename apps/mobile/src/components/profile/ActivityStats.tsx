import { View } from 'react-native';
import Card from '@/components/ui/Card';
import { Title, Paragraph } from '@/components/ui/Typography';
import { useUiTheme } from '@/theme/useUiTheme';

type ActivityStatsProps = {
  documentsCount: number;
  documentsLimit?: number;
};

function getProgressColor(ratio: number, theme: ReturnType<typeof useUiTheme>) {
  if (ratio > 0.8) return '#ef4444';
  if (ratio > 0.5) return '#eab308';
  return theme.primary;
}

export default function ActivityStats({ documentsCount, documentsLimit = 30 }: ActivityStatsProps) {
  const theme = useUiTheme();
  const ratio = documentsCount / documentsLimit;
  const progressColor = getProgressColor(ratio, theme);

  return (
    <View className="mb-6">
      <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-70">
        Activity
      </Paragraph>
      <Card className="flex-1 items-center py-6 gap-4">
        <Title className="text-2xl mt-2">{documentsCount}</Title>
        <Paragraph className="text-xs">Documents</Paragraph>

        <View className="w-full px-6 gap-2">
          <View className="flex-row justify-between">
            <Paragraph className="text-xs" style={{ color: theme.mutedForeground }}>
              Storage
            </Paragraph>
            <Paragraph className="text-xs" style={{ color: theme.mutedForeground }}>
              {documentsCount}/{documentsLimit}
            </Paragraph>
          </View>
          <View
            style={{
              height: 6,
              backgroundColor: theme.muted,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.min(ratio, 1) * 100}%`,
                backgroundColor: progressColor,
                borderRadius: 3,
              }}
            />
          </View>
        </View>
      </Card>
    </View>
  );
}
