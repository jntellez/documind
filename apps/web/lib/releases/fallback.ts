import type { ReleaseMetadata } from "./types";

const OFFICIAL_APK_URL_PATTERN = /^https:\/\//i;

export function isValidReleaseMetadata(
  release: ReleaseMetadata | null | undefined,
): release is ReleaseMetadata {
  return Boolean(release?.apkAssetName && release.apkUrl && OFFICIAL_APK_URL_PATTERN.test(release.apkUrl));
}

export function getFallbackReleaseMetadata(
  fallbackRelease: ReleaseMetadata | null | undefined,
  officialReleasesUrl: string,
): ReleaseMetadata | null {
  if (!isValidReleaseMetadata(fallbackRelease)) {
    return null;
  }

  return {
    ...fallbackRelease,
    source: "fallback",
    isStale: true,
    officialReleasesUrl,
  };
}
