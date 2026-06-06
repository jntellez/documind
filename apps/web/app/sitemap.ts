import type { MetadataRoute } from "next";

import { siteConfig } from "@/features/site/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/download", "/privacy", "/support", "/terms"] as const;

  return routes.map((route) => ({
    url: `${siteConfig.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/download" ? 0.9 : 0.6,
  }));
}
