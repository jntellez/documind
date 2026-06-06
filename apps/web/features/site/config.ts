const repository = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY ?? "jntellez/documind";

export const releaseContract = {
  tagFormat: "v{version}",
  apkAssetFormat: "documind-android-v{version}.apk",
  metadataRevalidateSeconds: 900,
} as const;

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
  releaseContract,
} as const;
