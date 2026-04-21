import { View } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import { Title, Paragraph } from '@/components/ui/Typography';

type ProfileHeaderProps = {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
};

export default function ProfileHeader({ name, email, initials, avatarUrl }: ProfileHeaderProps) {
  return (
    <View className="items-center mb-8 mt-4">
      <Avatar fallback={initials} src={avatarUrl} alt={name} size="xl" />
      <Title className="text-2xl mt-4 mb-1">{name}</Title>
      <Paragraph className="text-sm">{email}</Paragraph>
    </View>
  );
}
