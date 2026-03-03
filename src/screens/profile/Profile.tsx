import { View, ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { Title, Paragraph } from '@/components/ui/Typography';
import { useAuth } from '@/context/AuthContext';
import { useDocuments } from '@/hooks/useDocuments';

export default function Profile() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { documents } = useDocuments();
  const isDark = colorScheme === 'dark';

  const name = user?.name || 'Unknown User';
  const email = user?.email || 'no-email@example.com';
  const initials = name.charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900">
      <ScrollView
        className="flex-1 p-4 pt-24"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar y datos principales */}
        <View className="items-center mb-8 mt-6">
          <Avatar
            fallback="U"
            className="w-24 h-24"
          />
          <Title className="text-2xl mt-4 mb-1">{name}</Title>
          <Paragraph className="text-sm">{email}</Paragraph>
        </View>

        {/* Info personal */}
        <View className="mb-6">
          <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-60">
            Personal Info
          </Paragraph>
          <Card>
            {/* Nombre */}
            <View className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-full shadow-md border border-white dark:border-white/20 items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color={isDark ? '#ccc' : '#333'} />
              </View>
              <View className="flex-1">
                <Paragraph className="text-xs opacity-60">Name</Paragraph>
                <Paragraph className="font-semibold text-zinc-900 dark:text-white">
                  {name}
                </Paragraph>
              </View>
            </View>

            {/* Email */}
            <View className="flex-row items-center p-4 border-t border-zinc-200/50 dark:border-zinc-700/50">
              <View className="w-10 h-10 rounded-full shadow-md border border-white dark:border-white/20 items-center justify-center mr-3">
                <Ionicons name="mail-outline" size={20} color={isDark ? '#ccc' : '#333'} />
              </View>
              <View className="flex-1">
                <Paragraph className="text-xs opacity-60">Email</Paragraph>
                <Paragraph className="font-semibold text-zinc-900 dark:text-white">
                  {email}
                </Paragraph>
              </View>
            </View>
          </Card>
        </View>

        {/* Estadísticas */}
        <View className="mb-6">
          <Paragraph className="text-xs uppercase font-semibold mb-2 px-1 opacity-60">
            Activity
          </Paragraph>
          <View className="flex-row gap-4">
            <Card className="flex-1 items-center py-6">
              <Title className="text-2xl mt-2">{documents.length}</Title>
              <Paragraph className="text-xs">Documents</Paragraph>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
