import Ionicons from '@expo/vector-icons/Ionicons';
import ActionRow from '@/components/ui/ActionRow';
import SectionBlock from '@/components/ui/SectionBlock';
import { useUiTheme } from '@/theme/useUiTheme';

type PersonalInfoProps = {
  name: string;
  email: string;
};

export default function PersonalInfo({ name, email }: PersonalInfoProps) {
  const theme = useUiTheme();

  return (
    <SectionBlock title="Personal Info">
      <ActionRow
        title={name}
        description="Name"
        icon={<Ionicons name="person-outline" size={20} color={theme.icon} />}
      />
      <ActionRow
        title={email}
        description="Email"
        icon={<Ionicons name="mail-outline" size={20} color={theme.icon} />}
      />
    </SectionBlock>
  );
}
