import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { cn } from '@/lib/cn';
import Card from './Card';
import Icon from './Icon';

type ExpandableCardHeaderRenderProps = {
  isExpanded: boolean;
  toggleExpanded: () => void;
  setExpanded: (value: boolean) => void;
  chevronRotationStyle: { transform: { rotate: Animated.AnimatedInterpolation<string> }[] };
};

type ExpandableCardProps = {
  renderHeader: (props: ExpandableCardHeaderRenderProps) => React.ReactNode;
  expandedContent: React.ReactNode;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (value: boolean) => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  contentContainerClassName?: string;
};

export function ExpandableChevronButton({
  onPress,
  rotationStyle,
  className,
}: {
  onPress: (event: GestureResponderEvent) => void;
  rotationStyle: { transform: { rotate: Animated.AnimatedInterpolation<string> }[] };
  className?: string;
}) {
  return (
    <Pressable
      onPress={(event) => onPress(event)}
      className={cn('p-0.5 active:opacity-50 mt-1', className)}
      hitSlop={8}
    >
      <Animated.View style={rotationStyle}>
        <Icon library="feather" name="chevron-down" size="md" tone="mutedForeground" className="pr-0.5" />
      </Animated.View>
    </Pressable>
  );
}

export default function ExpandableCard({
  renderHeader,
  expandedContent,
  isExpanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
  headerClassName,
  contentClassName,
  contentContainerClassName,
}: ExpandableCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState(0);
  const animatedValue = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const expanded = isExpanded ?? internalExpanded;

  const setExpanded = (value: boolean) => {
    if (isExpanded === undefined) {
      setInternalExpanded(value);
    }
    onExpandedChange?.(value);
  };

  const toggleExpanded = () => setExpanded(!expanded);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [animatedValue, expanded]);

  const chevronRotationStyle = useMemo(
    () => ({
      transform: [
        {
          rotate: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          }),
        },
      ],
    }),
    [animatedValue],
  );

  const renderExpandedContent = () => (
    <View className={cn('border-t border-border dark:border-dark-border', contentContainerClassName)}>
      <View className={contentClassName}>{expandedContent}</View>
    </View>
  );

  return (
    <Card className={cn('overflow-hidden p-0 gap-0', className)}>
      <View className={headerClassName}>
        {renderHeader({ isExpanded: expanded, toggleExpanded, setExpanded, chevronRotationStyle })}
      </View>

      <View
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        style={{ position: 'absolute', opacity: 0, left: 0, right: 0 }}
        onLayout={(event) => {
          const measuredHeight = event.nativeEvent.layout.height;
          if (measuredHeight > 0 && measuredHeight !== contentHeight) {
            setContentHeight(measuredHeight);
          }
        }}
      >
        {renderExpandedContent()}
      </View>

      <Animated.View
        style={{
          height: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, contentHeight],
          }),
          opacity: animatedValue,
          overflow: 'hidden',
        }}
      >
        {renderExpandedContent()}
      </Animated.View>
    </Card>
  );
}
