import type { ReleaseMetadata } from "@/lib/releases/types";

const repository = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY ?? "jntellez/documind";

export const siteConfig = {
  name: "Documind",
  description: "Read, organize, and chat with your documents on Android.",
  githubRepository: repository,
  officialReleasesUrl: `https://github.com/${repository}/releases`,
  primaryCtaLabel: "Download for Android",
  supportEmail: "juantellez916@gmail.com",
  footerLinks: [
    { href: "/download", label: "Download" },
    { href: "/privacy", label: "Privacy" },
    { href: "/support", label: "Support" },
    { href: "/terms", label: "Terms" },
  ],
  copyrightYear: new Date().getFullYear(),
  developerUser: "jntellez",
} as const;

export const seededFallbackRelease: ReleaseMetadata = {
  version: "1.0.0",
  tagName: "v1.0.0",
  apkUrl: `${siteConfig.officialReleasesUrl}/download/v1.0.0/documind-android-v1.0.0.apk`,
  apkAssetName: "documind-android-v1.0.0.apk",
  publishedAt: "2026-01-01T00:00:00.000Z",
  source: "fallback",
  isStale: true,
  officialReleasesUrl: siteConfig.officialReleasesUrl,
};
