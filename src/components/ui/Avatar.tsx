import { Image, Text, TouchableOpacity } from "react-native";
import { useState } from "react";

type AvatarProps = {
  src?: string;
  alt?: string;
  fallback: string;
  classname?: string;
}

export default function Avatar({ src, alt, fallback, classname }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity className={`flex items-center justify-center overflow-hidden p-1 rounded-full bg-zinc-300 dark:bg-zinc-600 w-10 h-10 ${classname}`}>
      {src && !imageError ? (
        <Image
          source={{ uri: src }}
          alt={alt}
          className="w-10 h-10 rounded-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <Text className="text-black dark:text-white font-semibold">{fallback}</Text>
      )}
    </TouchableOpacity>
  );
}