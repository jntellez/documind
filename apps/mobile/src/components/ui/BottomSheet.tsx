import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal as RNModal,
  PanResponder,
  Pressable,
  ScrollView,
  type ScrollViewProps,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/lib/cn";
import { Title } from "./Typography";

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  scrollable?: boolean;
  scrollViewProps?: Omit<ScrollViewProps, "children">;
  showDragHandle?: boolean;
};

const ANIMATION_DURATION = 220;
const DEFAULT_HIDDEN_OFFSET = 420;
const MIN_DISMISS_THRESHOLD = 80;
const MAX_DISMISS_THRESHOLD = 160;

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
  className,
  contentClassName,
  scrollable = false,
  scrollViewProps,
  showDragHandle = true,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(DEFAULT_HIDDEN_OFFSET)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(DEFAULT_HIDDEN_OFFSET);
  const isGestureDismissingRef = useRef(false);

  const hiddenOffset = Math.max(sheetHeight, DEFAULT_HIDDEN_OFFSET);
  const dismissThreshold = Math.min(
    Math.max(sheetHeight * 0.25, MIN_DISMISS_THRESHOLD),
    MAX_DISMISS_THRESHOLD,
  );

  const animateToPosition = (toValue: number, onComplete?: () => void) => {
    const nextBackdropOpacity = Math.max(0, Math.min(1, 1 - toValue / hiddenOffset));

    Animated.parallel([
      Animated.timing(translateY, {
        toValue,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: nextBackdropOpacity,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onComplete?.();
      }
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 2 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          gestureState.dy > 2 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          translateY.stopAnimation();
          backdropOpacity.stopAnimation();
          isGestureDismissingRef.current = false;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextTranslateY = Math.max(0, gestureState.dy);
          translateY.setValue(nextTranslateY);
          backdropOpacity.setValue(Math.max(0, Math.min(1, 1 - nextTranslateY / hiddenOffset)));
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy >= dismissThreshold || gestureState.vy >= 1.2) {
            isGestureDismissingRef.current = true;
            animateToPosition(hiddenOffset, onClose);

            return;
          }

          animateToPosition(0);
        },
        onPanResponderTerminate: () => {
          animateToPosition(0);
        },
      }),
    [backdropOpacity, dismissThreshold, hiddenOffset, onClose, translateY],
  );

  useEffect(() => {
    if (visible) {
      setIsMounted(true);

      isGestureDismissingRef.current = false;
      animateToPosition(0);

      return;
    }

    if (isGestureDismissingRef.current) {
      isGestureDismissingRef.current = false;
      setIsMounted(false);

      return;
    }

    animateToPosition(hiddenOffset, () => {
      setIsMounted(false);
    });
  }, [hiddenOffset, visible]);

  const bottomPadding = useMemo(() => Math.max(insets.bottom, 16), [insets.bottom]);

  if (!isMounted) {
    return null;
  }

  const sheetContent = scrollable ? (
    <ScrollView
      {...scrollViewProps}
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        scrollViewProps?.contentContainerStyle,
      ]}
      className="px-4 pt-2"
    >
      <View className={contentClassName} style={{ paddingBottom: bottomPadding }}>
        {children}
      </View>
    </ScrollView>
  ) : (
    <View className={cn("px-4 pt-2", contentClassName)} style={{ paddingBottom: bottomPadding }}>
      {children}
    </View>
  );

  return (
    <RNModal transparent visible={isMounted} animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 bg-black"
          style={{
            opacity: backdropOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.45],
            }),
          }}
        />

        <Pressable className="absolute inset-0" onPress={onClose} />

        <Animated.View
          style={{ transform: [{ translateY }] }}
          onLayout={({ nativeEvent }) => {
            setSheetHeight((currentHeight) => {
              const nextHeight = nativeEvent.layout.height;

              return nextHeight > 0 && nextHeight !== currentHeight ? nextHeight : currentHeight;
            });
          }}
          className={cn(
            "max-h-[85%] rounded-t-[28px] border border-b-0 border-border bg-background dark:border-dark-border dark:bg-dark-background",
            className,
          )}
        >
          <View
            className="items-center px-4 pb-3 pt-3"
            collapsable={false}
            {...panResponder.panHandlers}
          >
            {showDragHandle ? (
              <View className="h-1.5 w-12 rounded-full bg-border dark:bg-dark-border" />
            ) : null}
            {title ? <Title className="mt-3 text-xl">{title}</Title> : null}
          </View>

          {sheetContent}
        </Animated.View>
      </View>
    </RNModal>
  );
}
