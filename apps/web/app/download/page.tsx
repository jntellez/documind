import type { Metadata } from "next";
import { DownloadCard } from "@/features/download/components/download-card";
import { getDownloadRelease } from "@/features/download/server/get-download-release";
import { landingContent } from "@/features/landing/content";
import { siteConfig } from "@/features/site/config";
import { SecondaryPageHeader } from "@/features/site/components/secondary-page-header";
import { buildPageMetadata } from "@/features/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Official Android APK Download",
  description: "Download the official Documind Android APK with trusted release details and fallback links to the first-party GitHub releases feed.",
  path: "/download",
});

export default async function DownloadPage() {
  const release = await getDownloadRelease();

  return (
    <div className="marketing-page-shell">
      <SecondaryPageHeader currentPage="download" />
      <main className="marketing-page-container">
        <div className="marketing-copy-container flex flex-col gap-8">
          <header className="space-y-4">
            <p className="marketing-eyebrow">Official download</p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-[-0.03em] text-balance text-[#1c1b1b] sm:text-5xl">
              Download Documind for Android
            </h1>
            <p className="marketing-lead max-w-2xl text-base leading-7 sm:text-[1.05rem] sm:leading-8">
              {landingContent.downloadCta.helperText} This route shows the most trustworthy release metadata we can resolve and falls back safely when live release data is incomplete.
            </p>
          </header>

          <DownloadCard release={release} officialReleasesUrl={siteConfig.officialReleasesUrl} />
        </div>
      </main>
    </div>
  );
}
