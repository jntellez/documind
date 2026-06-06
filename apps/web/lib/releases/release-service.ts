import { seededFallbackRelease, siteConfig } from "@/features/site/config";

import type { ReleaseMetadata, ResolveReleaseMetadataInput } from "./types";
import { getFallbackReleaseMetadata, isValidReleaseMetadata } from "./fallback";
import { fetchLatestGitHubRelease } from "./github";

export function resolveReleaseMetadata({
  latestRelease,
  fallbackRelease,
}: ResolveReleaseMetadataInput): ReleaseMetadata | null {
  if (isValidReleaseMetadata(latestRelease)) {
    return latestRelease;
  }

  if (isValidReleaseMetadata(fallbackRelease)) {
    return fallbackRelease;
  }

  return null;
}

export async function getReleaseMetadata(): Promise<ReleaseMetadata | null> {
  const latestRelease = await fetchLatestGitHubRelease({
    repository: siteConfig.githubRepository,
    officialReleasesUrl: siteConfig.officialReleasesUrl,
  }).catch(() => null);

  return resolveReleaseMetadata({
    latestRelease,
    fallbackRelease: getFallbackReleaseMetadata(
      seededFallbackRelease,
      siteConfig.officialReleasesUrl,
    ),
  });
}
