export type ReleaseMetadata = {
  version?: string;
  tagName?: string;
  apkUrl: string;
  apkAssetName: string;
  publishedAt?: string;
  fileSizeBytes?: number;
  source: "github" | "fallback";
  isStale?: boolean;
  officialReleasesUrl?: string;
};

export type ResolveReleaseMetadataInput = {
  latestRelease?: ReleaseMetadata | null;
  fallbackRelease?: ReleaseMetadata | null;
};
