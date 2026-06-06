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
      <section className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-8">
        <h2 className="text-xl font-semibold text-white">Latest APK is temporarily unavailable</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
          We could not resolve the newest trusted APK yet. Use the official releases page while live metadata recovery is in progress.
        </p>
        <Link className="mt-6 inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-white/40 hover:bg-white/5" href={fallbackUrl}>
          Browse official releases
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-cyan-400/20 bg-white/5 p-8">
      {release.version ? <p className="text-sm font-medium text-cyan-300">Version {release.version}</p> : null}

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300">
        {release.tagName ? <p>Tagged {release.tagName}</p> : null}
        {release.publishedAt ? <p>Published {formatPublishedDate(release.publishedAt)}</p> : null}
        {release.fileSizeBytes ? <p>{formatFileSize(release.fileSizeBytes)}</p> : null}
      </div>

      <p className="mt-2 text-sm text-slate-300">Source: {getSourceLabel(release)}</p>
      {release.isStale ? <p className="mt-2 text-sm text-amber-200">Last confirmed release. Live metadata is temporarily unavailable.</p> : null}

      <Link className="mt-6 inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300" href={release.apkUrl}>
        {landingContent.downloadCta.label}
      </Link>
    </section>
  );
}
