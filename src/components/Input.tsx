import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { styled, useColorScheme } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';

const StyledBlurView = styled(ExpoBlurView);

interface GlassInputProps extends TextInputProps {
  className?: string;
  type?: 'text' | 'url' | 'email';
  onValidationChange?: (isValid: boolean) => void;
  showError?: boolean;
}

const GlassInput = React.forwardRef<TextInput, GlassInputProps>(
  (
    {
      className,
      type = 'text',
      placeholder,
      onValidationChange,
      showError = true,
      onChangeText,
      onBlur,
      ...props
    },
    ref
  ) => {
    const { colorScheme } = useColorScheme();
    const [error, setError] = useState<string>('');
    const [value, setValue] = useState<string>('');

    const validateUrl = (url: string): boolean => {
      const urlPattern = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/i;
      return urlPattern.test(url);
    };

    const handleChangeText = (text: string) => {
      setValue(text);
      setError('');
      onChangeText?.(text);
    };

    const handleBlur = (e: any) => {
      if (type === 'url' && value.length > 0) {
        const isValid = validateUrl(value);
        setError(isValid ? '' : 'Invalid URL format');
        onValidationChange?.(isValid);
      } else if (value.length > 0) {
        onValidationChange?.(true);
      }
      onBlur?.(e);
    };

    return (
      <View className="flex-1">
        <View
          className={`
            flex-1
            rounded-full
            border 
            ${error ? 'border-red-500' : 'border-white dark:border-white/20'}
            shadow-lg 
            overflow-hidden
          `}
        >
          <StyledBlurView
            intensity={100}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            className="absolute inset-0"
          />
          <TextInput
            ref={ref}
            className={`w-full p-4 text-black dark:text-white bg-transparent ${className}`}
            placeholder={placeholder}
            placeholderTextColor="#888888"
            cursorColor={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
            keyboardType={type === 'url' ? 'url' : 'default'}
            autoCapitalize={type === 'url' ? 'none' : 'sentences'}
            autoCorrect={false}
            onChangeText={handleChangeText}
            onBlur={handleBlur}
            {...props}
          />
        </View>
        {showError && error && (
          <Text className="text-red-500 text-sm mt-2 ml-4">{error}</Text>
        )}
      </View>
    );
  }
);

export default GlassInput;

