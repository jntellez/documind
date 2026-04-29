import { TouchableOpacity, View } from 'react-native';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { Paragraph } from '@/components/ui/Typography';

type DocumentTagFilterCardProps = {
  availableTags: string[];
  selectedTags: string[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleTag: (tag: string) => void;
};

export default function DocumentTagFilterCard({
  availableTags,
  selectedTags,
  isOpen,
  onToggleOpen,
  onToggleTag,
}: DocumentTagFilterCardProps) {
  return (
    <Card className="mb-4 mt-2 z-20 p-0 gap-0 overflow-hidden">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggleOpen}
        className="flex-row items-center justify-between px-5 py-3.5"
      >
        <View className="flex-row items-center">
          <Icon library="feather" name="filter" size="sm" tone="mutedForeground" />
          <Paragraph className="ml-5.5 text-sm font-semibold text-foreground dark:text-dark-foreground">
            Filtrar por Etiquetas {selectedTags.length > 0 ? `(${selectedTags.length})` : ''}
          </Paragraph>
        </View>
        <Icon library="feather" name={isOpen ? 'chevron-up' : 'chevron-down'} size="md" tone="mutedForeground" />
      </TouchableOpacity>

      {isOpen && (
        <View className="p-4">
          {availableTags.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);

                return (
                  <Button
                    key={`dropdown-tag-${tag}`}
                    onPress={() => onToggleTag(tag)}
                    variant={isSelected ? 'icon-end' : 'default'}
                    icon={<Icon library="feather" name="check" size="xs" tone="muted" />}
                    size="sm"
                    tone={isSelected ? 'primary' : 'default'}
                    textClassName="font-medium"
                    title={tag}
                  />
                );
              })}
            </View>
          ) : (
            <Paragraph className="text-sm text-center py-1.5">
              No hay etiquetas disponibles
            </Paragraph>
          )}
        </View>
      )}
    </Card>
  );
}
