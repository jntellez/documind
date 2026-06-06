import { describe, expect, it } from "vitest";

import type { ReleaseMetadata } from "./types";
import { mapGitHubRelease, type GitHubReleasePayload } from "./github";
import { resolveReleaseMetadata } from "./release-service";

const githubRelease: ReleaseMetadata = {
  version: "1.2.3",
  tagName: "v1.2.3",
  apkUrl: "https://github.com/jntellez/documind/releases/download/v1.2.3/documind-android-v1.2.3.apk",
  apkAssetName: "documind-android-v1.2.3.apk",
  publishedAt: "2026-06-01T12:00:00.000Z",
  source: "github",
};

const fallbackRelease: ReleaseMetadata = {
  version: "1.2.2",
  tagName: "v1.2.2",
  apkUrl: "https://github.com/jntellez/documind/releases/download/v1.2.2/documind-android-v1.2.2.apk",
  apkAssetName: "documind-android-v1.2.2.apk",
  publishedAt: "2026-05-29T12:00:00.000Z",
  source: "fallback",
  isStale: true,
};

describe("resolveReleaseMetadata", () => {
  it("prefers the latest GitHub APK when it exists", () => {
    expect(
      resolveReleaseMetadata({
        latestRelease: githubRelease,
        fallbackRelease,
      }),
    ).toEqual(githubRelease);
  });

  it("falls back when an explicitly trusted backup APK exists", () => {
    expect(
      resolveReleaseMetadata({
        latestRelease: null,
        fallbackRelease,
      }),
    ).toEqual(fallbackRelease);
  });

  it("falls back when the latest GitHub release has no valid official APK asset", () => {
    const latestRelease = mapGitHubRelease(
      {
        tag_name: "v1.2.4",
        published_at: "2026-06-02T12:00:00.000Z",
        assets: [
          {
            name: "documind-desktop-v1.2.4.dmg",
            browser_download_url:
              "https://github.com/jntellez/documind/releases/download/v1.2.4/documind-desktop-v1.2.4.dmg",
            size: 3200,
          },
        ],
      },
      "https://github.com/jntellez/documind/releases",
    );

    expect(
      resolveReleaseMetadata({
        latestRelease,
        fallbackRelease,
      }),
    ).toEqual(fallbackRelease);
  });

  it("preserves stale fallback flags when live lookup fails", () => {
    expect(
      resolveReleaseMetadata({
        latestRelease: null,
        fallbackRelease,
      }),
    ).toMatchObject({
      source: "fallback",
      isStale: true,
      apkUrl: fallbackRelease.apkUrl,
    });
  });

  it("returns null when neither live nor fallback release has a valid APK URL", () => {
    expect(
      resolveReleaseMetadata({
        latestRelease: {
          source: "github",
          apkUrl: "",
          apkAssetName: "documind-android-v1.2.4.apk",
        },
        fallbackRelease: {
          source: "fallback",
          apkUrl: "",
          apkAssetName: "documind-android-v1.2.2.apk",
        },
      }),
    ).toBeNull();
  });

  it("returns null when no live or trusted backup APK exists", () => {
    expect(
      resolveReleaseMetadata({
        latestRelease: null,
        fallbackRelease: null,
      }),
    ).toBeNull();
  });
});

describe("mapGitHubRelease", () => {
  const officialReleasesUrl = "https://github.com/jntellez/documind/releases";

  it("maps the latest GitHub release into trusted APK metadata", () => {
    expect(
      mapGitHubRelease(
        {
          tag_name: "v1.2.3",
          published_at: "2026-06-01T12:00:00.000Z",
          assets: [
            {
              name: "documind-android-v1.2.3.apk",
              browser_download_url:
                "https://github.com/jntellez/documind/releases/download/v1.2.3/documind-android-v1.2.3.apk",
              size: 24_000_000,
            },
          ],
        },
        officialReleasesUrl,
      ),
    ).toEqual({
      version: "1.2.3",
      tagName: "v1.2.3",
      apkUrl:
        "https://github.com/jntellez/documind/releases/download/v1.2.3/documind-android-v1.2.3.apk",
      apkAssetName: "documind-android-v1.2.3.apk",
      publishedAt: "2026-06-01T12:00:00.000Z",
      fileSizeBytes: 24_000_000,
      source: "github",
      officialReleasesUrl,
    });
  });

  it("keeps partial trusted metadata without inventing missing labels", () => {
    expect(
      mapGitHubRelease(
        {
          tag_name: "release-2026-06",
          assets: [
            {
              name: "documind-android-v2026.06.apk",
              browser_download_url:
                "https://github.com/jntellez/documind/releases/download/release-2026-06/documind-android-v2026.06.apk",
              size: 18_500_000,
            },
          ],
        },
        officialReleasesUrl,
      ),
    ).toEqual({
      version: undefined,
      tagName: "release-2026-06",
      apkUrl:
        "https://github.com/jntellez/documind/releases/download/release-2026-06/documind-android-v2026.06.apk",
      apkAssetName: "documind-android-v2026.06.apk",
      publishedAt: undefined,
      fileSizeBytes: 18_500_000,
      source: "github",
      officialReleasesUrl,
    });
  });

  it("returns null when GitHub release data is missing an official APK asset", () => {
    const release: GitHubReleasePayload = {
      tag_name: "v1.2.5",
      published_at: "2026-06-03T08:00:00.000Z",
      assets: [
        {
          name: "release-notes.txt",
          browser_download_url:
            "https://github.com/jntellez/documind/releases/download/v1.2.5/release-notes.txt",
          size: 420,
        },
      ],
    };

    expect(mapGitHubRelease(release, officialReleasesUrl)).toBeNull();
  });
});
