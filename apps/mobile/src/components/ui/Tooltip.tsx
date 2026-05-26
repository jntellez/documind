import { useEffect, useMemo, useState } from "react";
import { Animated, Dimensions, Modal, Pressable } from "react-native";
import Card from "@/components/ui/Card";
import { Paragraph } from "@/components/ui/Typography";

type TooltipProps = {
  anchor: { x: number; y: number; width: number; height: number } | null;
  visible: boolean;
  onClose: () => void;
  message: string;
};

const { width: screenWidth } = Dimensions.get("window");
const TOOLTIP_WIDTH = Math.min(260, screenWidth - 32);

export default function Tooltip({ anchor, visible, onClose, message }: TooltipProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isMounted, setIsMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
      }
    });
  }, [visible, fadeAnim]);

  const position = useMemo(() => {
    if (!anchor) {
      return { left: 16, top: 96 };
    }

    const preferredLeft = anchor.x + anchor.width - TOOLTIP_WIDTH;
    const left = Math.max(16, Math.min(preferredLeft, screenWidth - TOOLTIP_WIDTH - 16));
    const top = anchor.y + anchor.height + 8;

    return { left, top };
  }, [anchor]);

  if (!isMounted) return null;

  return (
    <Modal transparent visible={isMounted} animationType="none" onRequestClose={onClose}>
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <Animated.View
          pointerEvents="none"
          style={{
            opacity: fadeAnim,
            position: "absolute",
            top: position.top,
            left: position.left,
            width: TOOLTIP_WIDTH,
          }}
        >
          <Card className="px-3 py-2 shadow-xl">
            <Paragraph className="text-sm leading-5">{message}</Paragraph>
          </Card>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
