import { Text, View } from 'react-native';
import Card from './Card';
import Icon from './Icon';
import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastContent = {
  text1?: string;
  text2?: string;
};

type GlassToastProps = {
  content: ToastContent;
  iconName: string;
  iconTone: 'success' | 'destructive' | 'primary' | 'warning';
};

const TOAST_ICON_BY_TYPE: Record<ToastType, { iconName: string; iconTone: GlassToastProps['iconTone'] }> = {
  success: { iconName: 'checkmark-circle', iconTone: 'success' },
  error: { iconName: 'close-circle', iconTone: 'destructive' },
  info: { iconName: 'information-circle', iconTone: 'primary' },
  warning: { iconName: 'warning', iconTone: 'warning' },
};

function GlassToast({
  content,
  iconName,
  iconTone,
}: GlassToastProps) {
  return (
    <Card className="flex-row items-center p-4 pl-6 mx-4">
      <Icon
        library="ionicons"
        name={iconName}
        variant="circle"
        containerTone="muted"
        size="xl"
        tone={iconTone}
      />
      <View className="ml-2 flex-1">
        <Text className="text-foreground dark:text-dark-foreground font-bold text-base">
          {content.text1}
        </Text>
        {content.text2 && (
          <Text className="text-muted-foreground dark:text-dark-muted-foreground text-sm">
            {content.text2}
          </Text>
        )}
      </View>
    </Card>
  );
}

const toastConfig: Record<ToastType, (props: ToastContent) => React.JSX.Element> = {
  success: (props) => <GlassToast content={props} {...TOAST_ICON_BY_TYPE.success} />,
  error: (props) => <GlassToast content={props} {...TOAST_ICON_BY_TYPE.error} />,
  info: (props) => <GlassToast content={props} {...TOAST_ICON_BY_TYPE.info} />,
  warning: (props) => <GlassToast content={props} {...TOAST_ICON_BY_TYPE.warning} />,
};

export function showToast({ type, text1, text2 }: { type: ToastType; text1: string; text2?: string }) {
  Toast.show({
    type,
    text1,
    text2,
    position: 'bottom',
    visibilityTime: 4000,
    bottomOffset: 98,
  });
}

export default toastConfig;
