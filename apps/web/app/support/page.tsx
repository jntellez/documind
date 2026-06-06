import type { Metadata } from "next";
import { SupportPageContent } from "@/features/legal/components/support-page-content";
import { buildPageMetadata } from "@/features/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Android Support",
  description: "Get Documind Android install help, official APK verification steps, troubleshooting guidance, and support contact details.",
  path: "/support",
});

export default function SupportPage() {
  return <SupportPageContent />;
}
