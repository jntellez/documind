const repository = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY ?? "jntellez/documind";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://documind.app";

export const releaseContract = {
  tagFormat: "v{version}",
  apkAssetFormat: "documind-android-v{version}.apk",
  metadataRevalidateSeconds: 900,
} as const;

export const siteConfig = {
  name: "Documind",
  siteUrl,
  description: "The official Android app to read, organize, and chat with PDFs and other documents.",
  githubRepository: repository,
  officialReleasesUrl: `https://github.com/${repository}/releases`,
  defaultTitle: "Documind for Android",
  titleTemplate: "%s | Documind",
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
  releaseContract,
} as const;
