import Icon from "@/components/ui/Icon";
import { Title } from "./Typography";
import Card from "./Card";
import { cn } from "@/lib/cn";

type UsageBadgeProps = {
  count: number;
  limit: number;
  className?: string;
  showDot?: boolean;
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

export default function UsageBadge({ count, limit, className, showDot = true }: UsageBadgeProps) {
  const ratio = getRatio(count, limit);
  const dotTone = getDotTone(ratio);

  return (
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
}
