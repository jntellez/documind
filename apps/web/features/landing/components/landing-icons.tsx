import { BadgeCheck, ChevronDown, CloudDownload, Download, Scale, Sparkles, Zap } from "lucide-react";

type LandingIconProps = {
  className?: string;
  testId?: string;
};

export function LandingIcon({ className = "h-4 w-4", testId }: LandingIconProps) {
  return (
    <Download
      absoluteStrokeWidth
      aria-hidden="true"
      className={className}
      data-testid={testId}
      strokeWidth={2.5}
    />
  );
}

const trustIconMap: Record<string, any> = {
  "badge-check": BadgeCheck,
  "cloud-download": CloudDownload,
  bolt: Zap,
  scale: Scale,
};

export function TrustIcon({ iconName }: { iconName: string }) {
  const Icon = trustIconMap[iconName] ?? Sparkles;

  return <Icon aria-hidden="true" className="h-4 w-4 text-slate-600" data-testid="trust-item-icon" />;
}

export function FaqChevronIcon() {
  return (
    <ChevronDown absoluteStrokeWidth aria-hidden="true" className="h-3.5 w-3.5" data-testid="faq-chevron" strokeWidth={1.6} />
  );
}
