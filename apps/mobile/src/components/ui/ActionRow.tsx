import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from './Card';
import IconBadge from './IconBadge';
import { Paragraph } from './Typography';
import { useUiTheme } from '@/theme/useUiTheme';

type ActionRowProps = {
  className?: string;
  description?: string;
  disabled?: boolean;
  icon?: ReactNode;
  iconTone?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'muted';
  onPress?: () => void;
  title: string;
  titleClassName?: string;
  trailing?: ReactNode;
};

export default function ActionRow({
  className,
  description,
  disabled = false,
  icon,
  iconTone = 'default',
  onPress,
  title,
  titleClassName,
  trailing,
}: ActionRowProps) {
  const theme = useUiTheme();
  const Container = onPress ? Pressable : View;

  return (
    <Card className={`p-0 ${className ?? ''}`}>
      <Container
        {...(onPress ? { onPress, disabled } : {})}
        className={`flex-row items-center justify-between p-4 ${onPress ? 'active:opacity-70' : ''} ${disabled ? 'opacity-50' : 'opacity-100'}`}
      >
        <View className="mr-3 flex-1 flex-row items-center">
          {icon ? (
            <IconBadge className="mr-3" tone={iconTone}>
              {icon}
            </IconBadge>
          ) : null}

          <View className="flex-1">
            <Paragraph className={`font-semibold text-foreground ${titleClassName ?? ''}`}>{title}</Paragraph>
            {description ? <Paragraph className="mt-0.5 text-sm">{description}</Paragraph> : null}
          </View>
        </View>

        {trailing ??
          (onPress ? <Ionicons name="chevron-forward" size={18} color={theme.iconMuted} /> : null)}
      </Container>
    </Card>
  );
}
