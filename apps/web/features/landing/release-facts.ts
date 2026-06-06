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
      id: "version",
      label: "Version",
      icon: "badge-check",
      value: getVersionValue(release),
      fallbackValue: "Syncs from latest release",
    },
    {
      id: "updated",
      label: "Updated",
      icon: "clock-3",
      value: release?.publishedAt ? formatPublishedDate(release.publishedAt) : undefined,
      fallbackValue: "Latest GitHub publish date",
    },
    {
      id: "size",
      label: "APK size",
      icon: "hard-drive-download",
      value: release?.fileSizeBytes ? formatFileSize(release.fileSizeBytes) : undefined,
      fallbackValue: "Shown when asset is available",
    },
    {
      id: "source",
      label: "Source",
      icon: "cloud-download",
      value: release ? "Official GitHub release" : undefined,
      fallbackValue: "Verified first-party route",
    },
  ];
}

export function getCompactReleaseSummary(release: ReleaseMetadata | null) {
  if (!release) {
    return [] as string[];
  }

  return [
    release.version ? `v${release.version} (Stable)` : release.tagName,
    release.publishedAt ? formatPublishedDate(release.publishedAt) : undefined,
    release.fileSizeBytes ? formatFileSize(release.fileSizeBytes) : undefined,
  ].filter((item): item is string => Boolean(item));
}
