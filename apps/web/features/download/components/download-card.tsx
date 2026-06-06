import Link from "next/link";

import { landingContent } from "@/features/landing/content";
import { siteConfig } from "@/features/site/config";
import type { ReleaseMetadata } from "@/lib/releases/types";

type DownloadCardProps = {
  release: ReleaseMetadata | null;
  officialReleasesUrl?: string;
};

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatFileSize(fileSizeBytes: number) {
  return `${Math.round(fileSizeBytes / (1024 * 1024))} MB APK`;
}

function getSourceLabel(release: ReleaseMetadata) {
  return release.source === "github" ? "Latest GitHub release" : "Verified fallback release";
}

export function DownloadCard({ release, officialReleasesUrl }: DownloadCardProps) {
  const fallbackUrl = release?.officialReleasesUrl ?? officialReleasesUrl ?? siteConfig.officialReleasesUrl;

  if (!release) {
    return (
      <section className="marketing-surface p-8 sm:p-10">
        <p className="marketing-eyebrow">Release status</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1c1b1b]">Latest APK is temporarily unavailable</h2>
        <p className="marketing-lead mt-3 max-w-2xl text-sm leading-7 sm:text-base">
          We could not resolve the newest trusted APK yet. Use the official releases page while live metadata recovery is in progress.
        </p>
        <Link className="marketing-secondary-button mt-6 w-full sm:w-auto" href={fallbackUrl}>
          Browse official releases
        </Link>
      </section>
    );
  }

  return (
    <section className="marketing-surface p-8 sm:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="marketing-eyebrow">Verified Android build</p>
          {release.version ? <p className="text-3xl font-extrabold tracking-[-0.03em] text-[#1c1b1b]">Version {release.version}</p> : null}
        </div>

        <Link className="marketing-primary-button w-full sm:w-auto" href={release.apkUrl}>
          {landingContent.downloadCta.label}
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#54647a]">
        {release.tagName ? <p>Tagged {release.tagName}</p> : null}
        {release.publishedAt ? <p>Published {formatPublishedDate(release.publishedAt)}</p> : null}
        {release.fileSizeBytes ? <p>{formatFileSize(release.fileSizeBytes)}</p> : null}
      </div>

      <p className="mt-3 text-sm leading-7 text-[#54647a]">Source: {getSourceLabel(release)}</p>
      {release.isStale ? <p className="mt-2 text-sm leading-7 text-amber-700">Last confirmed release. Live metadata is temporarily unavailable.</p> : null}
    </section>
  );
}
