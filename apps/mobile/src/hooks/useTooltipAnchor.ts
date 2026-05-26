import { useRef, useState } from "react";
import { View } from "react-native";

type TooltipAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function useTooltipAnchor() {
  const triggerRef = useRef<View>(null);
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState<TooltipAnchor | null>(null);

  function open() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setVisible(true);
    });
  }

  function close() {
    setVisible(false);
  }

  return {
    triggerRef,
    anchor,
    visible,
    open,
    close,
  };
}
