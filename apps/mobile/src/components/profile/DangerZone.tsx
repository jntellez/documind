import Ionicons from '@expo/vector-icons/Ionicons';
import ActionRow from '@/components/ui/ActionRow';
import SectionBlock from '@/components/ui/SectionBlock';
import { useUiTheme } from '@/theme/useUiTheme';

type DangerZoneProps = {
  onDeletePress: () => void;
};

export default function DangerZone({ onDeletePress }: DangerZoneProps) {
  const theme = useUiTheme();

  return (
    <SectionBlock title="Danger Zone" className="mb-10">
      <ActionRow
        title="Delete Account"
        description="Permanently delete your account and all data"
        icon={<Ionicons name="trash-outline" size={20} color={theme.destructive} />}
        iconTone="destructive"
        titleClassName="text-destructive"
        onPress={onDeletePress}
      />
    </SectionBlock>
  );
}
