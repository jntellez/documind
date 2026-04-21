import Ionicons from '@expo/vector-icons/Ionicons';
import Card from '@/components/ui/Card';
import IconBadge from '@/components/ui/IconBadge';
import SectionBlock from '@/components/ui/SectionBlock';
import { Title, Paragraph } from '@/components/ui/Typography';
import { useUiTheme } from '@/theme/useUiTheme';

type ActivityStatsProps = {
  documentsCount: number;
};

export default function ActivityStats({ documentsCount }: ActivityStatsProps) {
  const theme = useUiTheme();

  return (
    <SectionBlock title="Activity">
        <Card className="flex-1 items-center py-6">
          <IconBadge tone="primary">
            <Ionicons name="document-text-outline" size={20} color={theme.primaryForeground} />
          </IconBadge>
          <Title className="text-2xl mt-2">{documentsCount}</Title>
          <Paragraph className="text-xs">Documents</Paragraph>
        </Card>
    </SectionBlock>
  );
}
