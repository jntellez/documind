import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';
import Input from './Input';

type InputActionFieldProps = ComponentProps<typeof Input> & {
  action?: ReactNode;
  containerClassName?: string;
  leadingIcon?: ReactNode;
};

export default function InputActionField({
  action,
  className,
  containerClassName,
  leadingIcon,
  ...props
}: InputActionFieldProps) {
  return (
    <View className={`relative ${containerClassName ?? ''}`}>
      <Input
        className={`${leadingIcon ? 'pl-15' : ''} ${action ? 'pr-15' : ''} ${className ?? ''}`.trim()}
        {...props}
      />
      {leadingIcon ? (
        <View className="absolute left-2 top-2 h-10 w-10 items-center justify-center">{leadingIcon}</View>
      ) : null}
      {action ? <View className="absolute right-2 top-2">{action}</View> : null}
    </View>
  );
}
