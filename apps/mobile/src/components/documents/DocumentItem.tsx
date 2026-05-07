import { View, Pressable } from 'react-native';
import { Document } from 'types/api';
import { Paragraph, Title } from '../ui/Typography';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Icon from '../ui/Icon';
import ExpandableCard, { ExpandableChevronButton } from '../ui/ExpandableCard';

interface DocumentItemProps {
  document: Document;
  onPress: (document: Document) => void;
  onDelete?: (id: number) => void;
  onShare?: (document: Document) => void;
  onAddTag?: (document: Document) => void;
  variant?: 'default' | 'compact';
}

export default function DocumentItem({
  document,
  onPress,
  onDelete,
  onShare,
  onAddTag,
  variant = 'default',
}: DocumentItemProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (variant === 'compact') {
    return (
      <Card className="p-0">
        <Pressable onPress={() => onPress(document)} className="flex-row items-center justify-between p-4 active:opacity-70">
          <View className="flex-1 pr-3">
            <Title className="text-base font-semibold" numberOfLines={1}>
              {document.title}
            </Title>

            <Paragraph className="text-sm">
              {formatDate(document.created_at)}
            </Paragraph>
          </View>

          <Icon library="feather" name="chevron-right" size="md" tone="mutedForeground" />
        </Pressable>
      </Card>
    );
  }

  return (
    <ExpandableCard
      className="pb-0"
      contentContainerClassName="border-t-0"
      contentClassName="h-[60px]"
      renderHeader={({ toggleExpanded, chevronRotationStyle }) => (
        <Pressable onPress={() => onPress(document)} className="active:opacity-70 p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Title className="text-base font-semibold pr-4" numberOfLines={1}>
                {document.title}
              </Title>

              <Paragraph className="text-sm">
                {formatDate(document.created_at)}
              </Paragraph>

              {document.tags && document.tags.length > 0 && (
                <View className="flex-row flex-wrap gap-1 mt-1.5">
                  {document.tags.map((tag, index) => (
                    <Badge
                      key={`${document.id}-tag-${index}`}
                      className="shadow-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </View>
              )}
            </View>

            <ExpandableChevronButton
              onPress={(event) => {
                if (event && typeof event === 'object' && 'stopPropagation' in event) {
                  (event as { stopPropagation: () => void }).stopPropagation();
                }
                toggleExpanded();
              }}
              rotationStyle={chevronRotationStyle}
            />
          </View>
        </Pressable>
      )}
      expandedContent={(
        <View className="flex-row items-center justify-around h-full">
          <Button
            variant="icon-only"
            icon={<Icon library="ionicons" name="pricetag-outline" size="md" color="#a855f7" />}
            onPress={() => onAddTag?.(document)}
            className="p-0.5"
          />
          <Button
            variant="icon-only"
            icon={<Icon library="ionicons" name="share-outline" size="md" tone="primary" />}
            onPress={() => onShare?.(document)}
            className="p-0.5"
          />
          <Button
            variant="icon-only"
            icon={<Icon library="ionicons" name="trash-outline" size="md" tone="destructive" />}
            onPress={() => onDelete?.(document.id)}
            className="p-0.5"
          />
        </View>
      )}
    />
  );
}
