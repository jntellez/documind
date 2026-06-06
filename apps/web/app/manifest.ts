import type { MetadataRoute } from "next";

import { siteConfig } from "@/features/site/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.defaultTitle,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fcf9f8",
    theme_color: "#003ec7",
    icons: [
      {
        src: "/seo/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/seo/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
