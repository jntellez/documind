import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";
import { getDownloadRelease } from "@/features/download/server/get-download-release";
import { androidAppJsonLd, buildPageMetadata } from "@/features/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Official Android Document Reader & AI Chat App",
  description: "Download the official Documind Android app to read PDFs, organize documents, and chat with your files using AI.",
  path: "/",
});

export default async function HomePage() {
  const release = await getDownloadRelease();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(androidAppJsonLd) }}
      />
      <LandingPage release={release} />
    </>
  );
}
