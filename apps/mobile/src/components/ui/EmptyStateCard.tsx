import type { ReactNode } from 'react';
import { View } from 'react-native';
import Card from './Card';
import IconBadge from './IconBadge';
import { Paragraph, Title } from './Typography';

type EmptyStateCardProps = {
  children?: ReactNode;
  className?: string;
  description: string;
  icon: ReactNode;
  title: string;
};

export default function EmptyStateCard({ children, className, description, icon, title }: EmptyStateCardProps) {
  return (
    <Card className={`items-center justify-center py-10 ${className ?? ''}`}>
      <IconBadge size="xl" tone="muted">
        {icon}
      </IconBadge>
      <Title className="mt-5 text-center text-lg">{title}</Title>
      <Paragraph className="mt-2 text-center">{description}</Paragraph>
      {children ? <View className="mt-4 w-full">{children}</View> : null}
    </Card>
  );
}
