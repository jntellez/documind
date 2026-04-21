import Ionicons from '@expo/vector-icons/Ionicons';
import EmptyStateCard from '../ui/EmptyStateCard';
import { useUiTheme } from '@/theme/useUiTheme';

export default function EmptyState() {
  const theme = useUiTheme();

  return (
    <EmptyStateCard
      className="mx-2 mb-18 mt-6"
      icon={<Ionicons name="document-text-outline" size={28} color={theme.iconMuted} />}
      title="No documents yet"
      description="Start by processing a URL or uploading a document from the Home screen."
    />
  );
}
