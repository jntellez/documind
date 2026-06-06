import { DownloadCard } from "@/features/download/components/download-card";
import { getDownloadRelease } from "@/features/download/server/get-download-release";
import { landingContent } from "@/features/landing/content";
import { siteConfig } from "@/features/site/config";

export default async function DownloadPage() {
  const release = await getDownloadRelease();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-20">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Official download
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Download Documind for Android
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            {landingContent.downloadCta.helperText} This route shows the most trustworthy metadata we can resolve and falls back safely when live release data is incomplete.
          </p>
        </header>

        <DownloadCard release={release} officialReleasesUrl={siteConfig.officialReleasesUrl} />
      </main>
    </div>
  );
}
