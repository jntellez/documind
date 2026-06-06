import type { ReleaseMetadata } from "./types";

const OFFICIAL_APK_ASSET_PATTERN = /^documind-android-v[\w.-]+\.apk$/i;
const VERSION_FROM_TAG_PATTERN = /^v(?<version>[\w.-]+)$/i;

type GitHubReleaseAsset = {
  name?: string;
  browser_download_url?: string;
  size?: number;
};

export type GitHubReleasePayload = {
  tag_name?: string;
  published_at?: string;
  assets?: GitHubReleaseAsset[];
};

type FetchLatestGitHubReleaseOptions = {
  repository: string;
  officialReleasesUrl: string;
  fetcher?: typeof fetch;
  revalidateSeconds?: number;
};

function isOfficialApkAsset(asset: GitHubReleaseAsset | undefined): asset is Required<GitHubReleaseAsset> {
  return Boolean(
    asset?.name &&
      asset.browser_download_url &&
      OFFICIAL_APK_ASSET_PATTERN.test(asset.name),
  );
}

function getVersionFromTag(tagName: string | undefined) {
  return tagName?.match(VERSION_FROM_TAG_PATTERN)?.groups?.version;
}

export function mapGitHubRelease(
  release: GitHubReleasePayload,
  officialReleasesUrl: string,
): ReleaseMetadata | null {
  const apkAsset = release.assets?.find(isOfficialApkAsset);

  if (!apkAsset) {
    return null;
  }

  return {
    version: getVersionFromTag(release.tag_name),
    tagName: release.tag_name,
    apkUrl: apkAsset.browser_download_url,
    apkAssetName: apkAsset.name,
    publishedAt: release.published_at,
    fileSizeBytes: apkAsset.size,
    source: "github",
    officialReleasesUrl,
  };
}

export async function fetchLatestGitHubRelease({
  repository,
  officialReleasesUrl,
  fetcher = fetch,
  revalidateSeconds = 900,
}: FetchLatestGitHubReleaseOptions): Promise<ReleaseMetadata | null> {
  const response = await fetcher(`https://api.github.com/repos/${repository}/releases/latest`, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    next: {
      revalidate: revalidateSeconds,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as GitHubReleasePayload;

  return mapGitHubRelease(payload, officialReleasesUrl);
}
