import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from './Card';
import IconBadge from './IconBadge';
import { Paragraph } from './Typography';
import { useUiTheme } from '@/theme/useUiTheme';

type CollapsibleCardProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  icon?: ReactNode;
  iconTone?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'muted';
  isOpen: boolean;
  onToggle: () => void;
  title: string;
};

export default function CollapsibleCard({
  children,
  className,
  description,
  icon,
  iconTone = 'default',
  isOpen,
  onToggle,
  title,
}: CollapsibleCardProps) {
  const theme = useUiTheme();

  return (
    <Card className={`overflow-hidden p-0 ${className ?? ''}`}>
      <Pressable onPress={onToggle} className="flex-row items-center justify-between p-4 active:opacity-70">
        <View className="mr-3 flex-1 flex-row items-center">
          {icon ? (
            <IconBadge className="mr-3" tone={iconTone}>
              {icon}
            </IconBadge>
          ) : null}
          <View className="flex-1">
            <Paragraph className="font-semibold text-foreground">{title}</Paragraph>
            {description ? <Paragraph className="mt-0.5 text-sm">{description}</Paragraph> : null}
          </View>
        </View>

        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.iconMuted}
        />
      </Pressable>

      {isOpen ? (
        <View style={{ borderTopColor: theme.borderMuted }} className="border-t px-4 py-4">
          {children}
        </View>
      ) : null}
    </Card>
  );
}
