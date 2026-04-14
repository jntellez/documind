import { Image, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';

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
  const s = sizeStyles[size];

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        className={`flex items-center justify-center overflow-hidden rounded-full bg-zinc-300 dark:bg-zinc-600 ${s.container} ${className}`}
      >
        {src && !imageError ? (
          <Image
            source={{ uri: src }}
            alt={alt}
            className={`${s.image} rounded-full`}
            onError={() => setImageError(true)}
          />
        ) : (
          <Text className={`text-black dark:text-white font-semibold ${s.text}`}>{fallback}</Text>
        )}
      </TouchableOpacity>
      {editable && (
        <TouchableOpacity
          onPress={onEditPress}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-500 items-center justify-center border-2 border-white dark:border-zinc-900"
        >
          <Ionicons name="camera" size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}