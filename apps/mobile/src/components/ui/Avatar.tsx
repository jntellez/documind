import { Image, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import { cn } from '@/lib/cn';
import { useUiTheme } from '@/theme/useUiTheme';

const sizeStyles = {
  sm: { container: 'w-8 h-8', image: 'w-8 h-8', text: 'text-xs', icon: 14 },
  md: { container: 'w-10 h-10', image: 'w-10 h-10', text: 'text-sm', icon: 18 },
  lg: { container: 'w-16 h-16', image: 'w-16 h-16', text: 'text-xl', icon: 28 },
  xl: { container: 'w-24 h-24', image: 'w-24 h-24', text: 'text-3xl', icon: 40 },
};

type AvatarSize = keyof typeof sizeStyles;

type AvatarProps = {
  src?: string;
  alt?: string;
  fallback: string;
  size?: AvatarSize;
  className?: string;
  onPress?: () => void;
  editable?: boolean;
  onEditPress?: () => void;
}

export default function Avatar({ src, alt, fallback, size = 'md', className, onPress, editable, onEditPress }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const theme = useUiTheme();
  const s = sizeStyles[size];

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full bg-muted dark:bg-dark-muted',
          s.container,
          className,
        )}
      >
        {src && !imageError ? (
          <Image
            source={{ uri: src }}
            alt={alt}
            className={cn(s.image, 'rounded-full')}
            onError={() => setImageError(true)}
          />
        ) : (
          <Text className={cn('text-foreground dark:text-dark-foreground font-semibold', s.text)}>{fallback}</Text>
        )}
      </TouchableOpacity>
      {editable && (
        <TouchableOpacity
          onPress={onEditPress}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary dark:bg-dark-primary border-2 border-background dark:border-dark-background items-center justify-center"
        >
          <Ionicons name="camera" size={16} color={theme.iconOnPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}
