import type { ReleaseMetadata } from "@/lib/releases/types";

type LandingReleaseFact = {
  fallbackValue: string;
  icon: string;
  id: string;
  label: string;
  value?: string;
};

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatPublishedDateWithDay(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatFileSize(fileSizeBytes: number) {
  return `${Math.round(fileSizeBytes / (1024 * 1024))} MB`;
}

function getVersionValue(release: ReleaseMetadata | null) {
  if (release?.version) {
    return `v${release.version}`;
  }

  if (release?.tagName) {
    return release.tagName;
  }

  return undefined;
}

export function getLandingReleaseFacts(release: ReleaseMetadata | null): LandingReleaseFact[] {
  return [
    {
      id: "distribution",
      label: "Official Android Distribution",
      icon: "badge-check",
      value: undefined,
      fallbackValue: "Official Android Distribution",
    },
    {
      id: "security",
      label: "Secure APK",
      icon: "shield",
      value: getVersionValue(release),
      fallbackValue: "Verified release metadata",
    },
    {
      id: "updated",
      label: "Last Updated",
      icon: "clock-3",
      value: release?.publishedAt ? formatPublishedDate(release.publishedAt) : undefined,
      fallbackValue: "Release sync active",
    },
    {
      id: "size",
      label: "APK Size",
      icon: "hard-drive-download",
      value: release?.fileSizeBytes ? formatFileSize(release.fileSizeBytes) : undefined,
      fallbackValue: "APK size shown when release asset is available",
    },
  ];
}

export function getCompactReleaseSummary(release: ReleaseMetadata | null) {
  if (!release) {
    return [] as string[];
  }

  return [
    release.version ? `v${release.version} (Stable)` : release.tagName,
    release.publishedAt ? formatPublishedDateWithDay(release.publishedAt) : undefined,
    release.fileSizeBytes ? formatFileSize(release.fileSizeBytes) : undefined,
  ].filter((item): item is string => Boolean(item));
}
