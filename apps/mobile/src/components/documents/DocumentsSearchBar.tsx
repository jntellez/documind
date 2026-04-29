import { View } from 'react-native';

import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';

type DocumentsSearchBarProps = {
  onChangeText: (value: string) => void;
};

export default function DocumentsSearchBar({ onChangeText }: DocumentsSearchBarProps) {
  return (
    <View className="mb-4 z-10 h-15.5 relative">
      <Input
        placeholder="Buscar documentos"
        onChangeText={onChangeText}
        type="text"
        showError={false}
        autoCapitalize="none"
        className="p-5 pl-15"
      />
      <View className="size-[40px] absolute left-2 top-2 items-center justify-center">
        <Icon library="feather" name="search" size="md" tone="mutedForeground" />
      </View>
    </View>
  );
}
