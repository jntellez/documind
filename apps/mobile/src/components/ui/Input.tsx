import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { styled, useColorScheme } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';

const StyledBlurView = styled(ExpoBlurView);

interface InputProps extends TextInputProps {
  className?: string;
  type?: 'text' | 'url' | 'email';
  onValidationChange?: (isValid: boolean) => void;
  showError?: boolean;
  defaultValue?: string;
}

export default function Input({
  className,
  type = 'text',
  placeholder,
  onValidationChange,
  showError = true,
  onChangeText,
  onBlur,
  defaultValue,
  ...props
}: InputProps) {
  const { colorScheme } = useColorScheme();
  const [error, setError] = useState<string>('');
  const [value, setValue] = useState<string>(defaultValue || "");
  const [touched, setTouched] = useState<boolean>(false);

  function validateUrl(url: string): boolean {
    const urlPattern = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/i;
    return urlPattern.test(url);
  }

  function handleChangeText(text: string) {
    setValue(text);

    if (type === 'url' && text.length > 0) {
      const isValid = validateUrl(text);
      onValidationChange?.(isValid);
      if (touched) {
        setError(isValid ? '' : 'Invalid URL format');
      }
    } else {
      onValidationChange?.(text.length > 0);
      if (touched) {
        setError('');
      }
    }

    onChangeText?.(text);
  }

  function handleBlur(e: any) {
    setTouched(true);

    if (type === 'url' && value.length > 0) {
      const isValid = validateUrl(value);
      setError(isValid ? '' : 'Invalid URL format');
    }

    onBlur?.(e);
  }

  return (
    <View className="flex-1">
      <View
        className={`
          flex-1
          rounded-full
          border 
          ${touched && error ? 'border-red-500' : 'border-white dark:border-white/20'}
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
          className={`w-full p-4 text-black dark:text-white bg-transparent ${className}`}
          placeholder={placeholder}
          placeholderTextColor="#888888"
          value={value}
          cursorColor={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
          keyboardType={type === 'url' ? 'url' : 'default'}
          autoCapitalize={type === 'url' ? 'none' : 'sentences'}
          autoCorrect={false}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          {...props}
        />
      </View>
      {showError && touched && error && (
        <Text className="text-red-500 text-sm mt-2 ml-4">{error}</Text>
      )}
    </View>
  );
}

