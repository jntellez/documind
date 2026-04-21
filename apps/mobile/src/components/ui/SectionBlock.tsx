import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Paragraph } from './Typography';

type SectionBlockProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  title?: string;
};

export default function SectionBlock({ children, className, description, title }: SectionBlockProps) {
  return (
    <View className={`mb-6 ${className ?? ''}`}>
      {title ? (
        <Paragraph className="px-1 text-xs font-semibold uppercase opacity-60">{title}</Paragraph>
      ) : null}
      {description ? <Paragraph className="mt-1 px-1 text-sm">{description}</Paragraph> : null}
      <View className={title || description ? 'mt-3 gap-3' : undefined}>{children}</View>
    </View>
  );
}
