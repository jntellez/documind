function createIcon(name: string) {
  return function Icon({ absoluteStrokeWidth: _absoluteStrokeWidth, ...props }: any) {
    return <svg aria-hidden="true" data-lucide={name} {...props} />;
  };
}

export const ArrowUpRight = createIcon("arrow-up-right");
export const BadgeCheck = createIcon("badge-check");
export const ChevronDown = createIcon("chevron-down");
export const Clock3 = createIcon("clock-3");
export const CloudDownload = createIcon("cloud-download");
export const Download = createIcon("download");
export const HardDriveDownload = createIcon("hard-drive-download");
export const Scale = createIcon("scale");
export const ShieldCheck = createIcon("shield-check");
export const Smartphone = createIcon("smartphone");
export const Sparkles = createIcon("sparkles");
export const Zap = createIcon("zap");
