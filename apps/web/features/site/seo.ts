import type { Metadata } from "next";

import { siteConfig } from "@/features/site/config";

const sharedOpenGraphImage = {
  url: "/seo/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} Android app preview`,
} as const;

type PageMetadataOptions = {
  description?: string;
  noIndex?: boolean;
  path?: `/${string}` | "/";
  title: string;
};

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.defaultTitle,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [sharedOpenGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [sharedOpenGraphImage.url],
  },
  icons: {
    icon: [{ url: "/seo/icon", type: "image/png" }],
    apple: [{ url: "/seo/apple-icon", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export function buildPageMetadata({ title, description, path = "/", noIndex = false }: PageMetadataOptions): Metadata {
  const resolvedDescription = description ?? siteConfig.description;

  return {
    title,
    description: resolvedDescription,
    alternates: {
      canonical: path,
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: siteConfig.name,
      url: path,
      title,
      description: resolvedDescription,
      images: [sharedOpenGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
      images: [sharedOpenGraphImage.url],
    },
  };
}

export const androidAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  operatingSystem: "Android",
  applicationCategory: "ProductivityApplication",
  description: siteConfig.description,
  url: siteConfig.siteUrl,
  downloadUrl: `${siteConfig.siteUrl}/download`,
  softwareVersion: "Latest",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
  },
  sameAs: [siteConfig.officialReleasesUrl],
} as const;
