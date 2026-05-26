import { Pressable } from "react-native";
import Icon from "@/components/ui/Icon";
import { Title } from "./Typography";
import Card from "./Card";
import Tooltip from "./Tooltip";
import { useTooltipAnchor } from "@/hooks/useTooltipAnchor";
import { cn } from "@/lib/cn";

type UsageBadgeProps = {
  count: number;
  limit: number;
  className?: string;
  showDot?: boolean;
  tooltipMessage?: string;
};

function getRatio(count: number, limit: number): number {
  if (limit === 0) return 0;
  return count / limit;
}

function getDotTone(ratio: number): "success" | "warning" | "destructive" {
  if (ratio > 0.8) return "destructive";
  if (ratio > 0.5) return "warning";
  return "success";
}

export default function UsageBadge({
  count,
  limit,
  className,
  showDot = true,
  tooltipMessage,
}: UsageBadgeProps) {
  const tooltip = useTooltipAnchor();
  const ratio = getRatio(count, limit);
  const dotTone = getDotTone(ratio);

  const hasTooltip = !!tooltipMessage;

  const badgeContent = (
    <Card className={cn("flex-row items-center justify-center gap-1.5 px-4 py-1.5 shadow-md", className)}>
      {showDot && (
        <Icon
          library="octicons"
          name="dot-fill"
          tone={dotTone}
          size={10}
        />
      )}
      <Title className="text-sm">
        {count}/{limit}
      </Title>
    </Card>
  );

  if (!hasTooltip) {
    return badgeContent;
  }

  return (
    <>
      <Pressable
        ref={tooltip.triggerRef}
        onPress={tooltip.open}
      >
        {badgeContent}
      </Pressable>
      <Tooltip
        anchor={tooltip.anchor}
        visible={tooltip.visible}
        onClose={tooltip.close}
        message={tooltipMessage ?? ""}
      />
    </>
  );
}
