import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { styled } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { cn } from '@/lib/cn';
import { useUiTheme } from '@/theme/useUiTheme';

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
  const theme = useUiTheme();
  const [error, setError] = useState<string>('');
  const [value, setValue] = useState<string>(defaultValue || "");
  const [touched, setTouched] = useState<boolean>(false);
  const hasError = touched && Boolean(error);

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
        className={cn(
          'flex-1 rounded-full bg-surface dark:bg-dark-surface border shadow-lg overflow-hidden',
          hasError
            ? 'border-destructive dark:border-dark-destructive'
            : 'border-input-border dark:border-dark-input-border',
        )}
      >
        <StyledBlurView
          intensity={100}
          tint={theme.blurTint}
          className="absolute inset-0"
        />
        <TextInput
          className={cn(
            'w-full p-4 text-foreground dark:text-dark-foreground bg-transparent',
            className,
          )}
          placeholder={placeholder}
          placeholderTextColor={theme.placeholder}
          value={value}
          cursorColor={theme.cursor}
          keyboardType={type === 'url' ? 'url' : 'default'}
          autoCapitalize={type === 'url' ? 'none' : 'sentences'}
          autoCorrect={false}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          {...props}
        />
      </View>
      {showError && hasError && (
        <Text className="text-destructive dark:text-dark-destructive text-sm mt-2 ml-4">{error}</Text>
      )}
    </View>
  );
}
