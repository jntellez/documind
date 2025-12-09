import { View, Pressable, Animated } from 'react-native';
import { Document } from 'types/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from 'nativewind';
import { useState, useRef, useEffect } from 'react';
import { Paragraph, Title } from '../ui/Typography';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface DocumentItemProps {
  document: Document;
  onPress: (document: Document) => void;
  onDelete: (id: number) => void;
  onShare?: (document: Document) => void;
  onAddTag?: (document: Document) => void;
}

export default function DocumentItem({
  document,
  onPress,
  onDelete,
  onShare,
  onAddTag,
}: DocumentItemProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: isExpanded ? 60 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedRotation, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isExpanded]);

  const rotation = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Card className="overflow-hidden pb-0">
      {/* Header de la tarjeta */}
      <Pressable onPress={() => onPress(document)} className="active:opacity-70">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Title className="text-base font-semibold pr-4" numberOfLines={1}>
              {document.title}
            </Title>
            <Paragraph className="text-sm">
              {formatDate(document.created_at)}
            </Paragraph>
          </View>

          {/* Botón de expansión */}
          <Pressable
            onPress={() => setIsExpanded(!isExpanded)}
            className="p-0.5 active:opacity-50"
            hitSlop={8}
          >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Ionicons
                name="chevron-down"
                size={20}
                color={isDark ? '#fff' : '#000'}
              />
            </Animated.View>
          </Pressable>
        </View>
      </Pressable>

      {/* Acciones rápidas (menú oculto) */}
      <Animated.View
        style={{
          height: animatedHeight,
          opacity: animatedHeight.interpolate({
            inputRange: [0, 60],
            outputRange: [0, 1],
          }),
          overflow: 'hidden'
        }}
      >
        <View className="flex-row items-center justify-around">
          <Button
            variant="icon-only"
            icon={<Ionicons name="pricetag-outline" size={18} color={isDark ? "#a855f7" : "#9333ea"} />}
            onPress={() => onAddTag?.(document)}
            className="p-0.5"
          />
          <Button
            variant="icon-only"
            icon={<Ionicons name="share-outline" size={18} color={isDark ? "#3b82f6" : "#2563eb"} />}
            onPress={() => onShare?.(document)}
            className="p-0.5"
          />
          <Button
            variant="icon-only"
            icon={<Ionicons name="trash-outline" size={18} color="#ef4444" />}
            onPress={() => onDelete(document.id)}
            className="p-0.5"
          />
        </View>
      </Animated.View>
    </Card>
  );
}