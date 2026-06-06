import type { StaticImageData } from "next/image";

import heroDeviceHome from "../../../../assets/marketing/hero/documind-hero-device-home.png";
import showcaseAiChat from "../../../../assets/marketing/app-store/isolated/04-document-ai-chat.png";
import showcaseDocumentReader from "../../../../assets/marketing/app-store/isolated/03-document-reader.png";
import showcaseHomeLibrary from "../../../../assets/marketing/app-store/isolated/01-home-library.png";
import showcaseSettings from "../../../../assets/marketing/app-store/isolated/05-settings.png";

export type LandingNavItem = {
  href: string;
  label: string;
};

export type LandingTrustItem = {
  id: string;
  label: string;
  icon: string;
};

export type LandingShowcaseItem = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: StaticImageData;
  imageAlt: string;
  presentation: "standalone" | "soft-frame";
};

export const landingContent = {
  headerNav: [
    { href: "#showcase", label: "Features" },
    { href: "#start", label: "How it Works" },
    { href: "#faq", label: "FAQ" },
  ] satisfies LandingNavItem[],
  downloadCta: {
    href: "/download",
    label: "Download for Android",
    secondaryHref: "#showcase",
    secondaryLabel: "See how it works",
    helperText: "Official Android APK delivery backed by first-party GitHub Releases metadata.",
  },
  hero: {
    eyebrow: "Official Android release",
    title: "Interact with your documents like never before.",
    description:
      "Documind is the official Android app for reading, organizing, and chatting with PDFs and text documents from one focused workspace on your device.",
    image: heroDeviceHome,
    imageAlt: "Documind home library screen displayed on an Android device.",
  },
  trustItems: [
    { id: "official", label: "Official Android distribution", icon: "badge-check" },
    { id: "release", label: "Latest GitHub release", icon: "cloud-download" },
    { id: "trust", label: "Fast APK install flow", icon: "bolt" },
    { id: "support", label: "Legal and support routes", icon: "scale" },
  ] satisfies LandingTrustItem[],
  showcaseItems: [
    {
      id: "library",
      eyebrow: "Accessible Library",
      title: "Centralize Your Library",
      description:
        "Keep all your important documents in one secure, easily accessible place on your Android device. Organize by tags, folders, or let smart categorization handle it for you seamlessly.",
      image: showcaseHomeLibrary,
      imageAlt: "Documind Android library screen with imported documents.",
      presentation: "soft-frame",
    },
    {
      id: "reader",
      eyebrow: "Focused reading",
      title: "Intelligent Document Reading",
      description:
        "Experience a distraction-free reading mode optimized for mobile screens. Documind automatically parses complex layouts, making PDFs flow like native mobile text for effortless consumption.",
      image: showcaseDocumentReader,
      imageAlt: "Documind Android reader screen showing a document page.",
      presentation: "standalone",
    },
    {
      id: "chat",
      eyebrow: "AI assistance",
      title: "AI-Powered Conversations",
      description:
        "Do not just read—interact. Ask questions, extract summaries, and find specific data points within long documents in seconds using the deeply integrated AI assistant.",
      image: showcaseAiChat,
      imageAlt: "Documind Android AI chat screen answering questions about a document.",
      presentation: "standalone",
    },
    {
      id: "android",
      eyebrow: "Built for Android",
      title: "Built for Android",
      description:
        "Native performance, smooth animations, and deep system integration. Documind is crafted specifically to leverage the power of modern Android devices for lightning-fast document processing.",
      image: showcaseSettings,
      imageAlt: "Documind Android settings screen showing mobile-friendly controls.",
      presentation: "soft-frame",
    },
  ] satisfies LandingShowcaseItem[],
  steps: [
    {
      step: "1",
      title: "Download",
      description: "Get the official Android APK from the trusted download page.",
    },
    {
      step: "2",
      title: "Import",
      description: "Sync your local files or connect to your preferred cloud storage provider.",
    },
    {
      step: "3",
      title: "Interact",
      description: "Begin chatting with your documents immediately. No setup required.",
    },
  ],
  faq: [
    {
      question: "Is this the official download?",
      answer:
        "Yes. Download from documind.app or the linked first-party GitHub Releases route so you get the official Documind Android build and matching release details.",
    },
    {
      question: "How do I install the APK?",
      answer:
        "After downloading, tap the file to open it. Your device may prompt you to allow installation from unknown sources for your browser. Follow the prompt, then proceed with the installation.",
    },
    {
      question: "Do I need an internet connection?",
      answer:
        "Basic reading and document access work offline when the file is already on your device. Online connectivity unlocks AI-powered assistance.",
    },
  ],
  finalCta: {
    title: "Get the official Documind app",
    description:
      "Download the official Android build, verify the release source, and start reading or chatting with your documents from one trusted workflow.",
  },
} as const;

export function getShowcaseSlideLabel(index: number, total: number) {
  return `Slide ${index + 1} of ${total}`;
}
