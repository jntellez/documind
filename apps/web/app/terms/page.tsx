import type { Metadata } from "next";
import { TermsPageContent } from "@/features/legal/components/terms-page-content";
import { buildPageMetadata } from "@/features/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description: "Read the current Documind terms for website use, Android APK distribution, document processing, and support contact details.",
  path: "/terms",
});

export default function TermsPage() {
  return <TermsPageContent />;
}
