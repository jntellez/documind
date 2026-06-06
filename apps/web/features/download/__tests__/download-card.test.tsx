import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DownloadCard } from "@/features/download/components/download-card";
import type { ReleaseMetadata } from "@/lib/releases/types";
import { renderAsync } from "@/test/render";

describe("DownloadCard", () => {
  it("renders the official CTA with version, recency, and trust metadata", async () => {
    const release: ReleaseMetadata = {
      version: "1.2.3",
      tagName: "v1.2.3",
      apkUrl:
        "https://github.com/jntellez/documind/releases/download/v1.2.3/documind-android-v1.2.3.apk",
      apkAssetName: "documind-android-v1.2.3.apk",
      publishedAt: "2026-06-01T12:00:00.000Z",
      fileSizeBytes: 25_000_000,
      source: "github",
      officialReleasesUrl: "https://github.com/jntellez/documind/releases",
    };

    await renderAsync(<DownloadCard release={release} />);

    expect(screen.getByText(/version 1\.2\.3/i)).toBeInTheDocument();
    expect(screen.getByText(/tagged v1\.2\.3/i)).toBeInTheDocument();
    expect(screen.getByText(/published jun 1, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/24 mb apk/i)).toBeInTheDocument();
    expect(screen.getByText(/latest github release/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download for android/i })).toHaveAttribute(
      "href",
      "https://github.com/jntellez/documind/releases/download/v1.2.3/documind-android-v1.2.3.apk",
    );
  });

  it("omits missing labels while keeping available trusted metadata", async () => {
    const release: ReleaseMetadata = {
      apkUrl:
        "https://github.com/jntellez/documind/releases/download/release-2026-06/documind-android-v2026.06.apk",
      apkAssetName: "documind-android-v2026.06.apk",
      tagName: "release-2026-06",
      source: "github",
      officialReleasesUrl: "https://github.com/jntellez/documind/releases",
    };

    await renderAsync(<DownloadCard release={release} />);

    expect(screen.queryByText(/version/i)).not.toBeInTheDocument();
    expect(screen.getByText(/tagged release-2026-06/i)).toBeInTheDocument();
    expect(screen.queryByText(/published/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mb apk/i)).not.toBeInTheDocument();
  });

  it("renders a safe unavailable state when no trusted release is available", async () => {
    await renderAsync(
      <DownloadCard
        release={null}
        officialReleasesUrl="https://github.com/jntellez/documind/releases"
      />, 
    );

    expect(screen.getByText(/latest apk is temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse official releases/i })).toHaveAttribute(
      "href",
      "https://github.com/jntellez/documind/releases",
    );
  });
});
