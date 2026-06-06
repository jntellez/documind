import type { Metadata } from "next";
import { PrivacyPageContent } from "@/features/legal/components/privacy-page-content";
import { getPrivacyPolicyDocument } from "@/features/legal/server/privacy-policy";
import { buildPageMetadata } from "@/features/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "Review how Documind handles account data, documents, AI processing, and support contact details.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const policy = getPrivacyPolicyDocument();

  return <PrivacyPageContent policy={policy} />;
}
