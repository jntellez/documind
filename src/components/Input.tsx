import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { styled, useColorScheme } from 'nativewind';
import { BlurView as ExpoBlurView } from 'expo-blur';

const StyledBlurView = styled(ExpoBlurView);

interface GlassInputProps extends TextInputProps {
  className?: string;
}

const GlassInput = React.forwardRef<TextInput, GlassInputProps>(
  (
    {
      className,
      placeholderTextColor,
      ...props
    },
    ref
  ) => {
    const { colorScheme } = useColorScheme();

    return (
      <View
        className={`
          flex-1
          rounded-full
          border 
          border-white dark:border-white/20 
          shadow-lg 
          overflow-hidden 
          ${className}
        `}
      >
        <StyledBlurView
          intensity={100}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          className="absolute inset-0"
        />
        <TextInput
          ref={ref}
          className="w-full text-base p-4 text-black dark:text-white bg-transparent"
          placeholder="Enter a url"
          placeholderTextColor="#888888"
          cursorColor={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
          {...props}
        />
      </View>
    );
  }
);

export default GlassInput;

