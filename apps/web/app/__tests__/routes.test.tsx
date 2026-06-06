import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "@/features/site/components/site-footer";
import type { ReleaseMetadata } from "@/lib/releases/types";
import { renderAsync } from "@/test/render";

const getReleaseMetadata = vi.fn<() => Promise<ReleaseMetadata | null>>();

vi.mock("@/lib/releases/release-service", () => ({
  getReleaseMetadata,
}));

function renderRoute(node: React.ReactElement) {
  return renderAsync(node);
}

describe("landing routes", () => {
  beforeEach(() => {
    getReleaseMetadata.mockReset();
  });

  it("renders the landing page with header navigation, a primary CTA above the fold, and repeated download paths", async () => {
    const { default: HomePage } = await import("@/app/page");

    await renderRoute(<HomePage />);

    const primaryNavigation = screen.getByRole("navigation", { name: /primary/i });

    expect(within(primaryNavigation).getByRole("link", { name: /features/i })).toHaveAttribute(
      "href",
      "#showcase",
    );
    expect(within(primaryNavigation).getByRole("link", { name: /^how it works$/i })).toHaveAttribute(
      "href",
      "#start",
    );
    expect(within(primaryNavigation).getByRole("link", { name: /^faq$/i })).toHaveAttribute(
      "href",
      "#faq",
    );
    expect(within(screen.getByRole("banner")).getByRole("link", { name: /^download$/i })).toHaveAttribute(
      "href",
      "/download",
    );

    expect(
      screen.getByRole("heading", {
        name: /interact with your documents like never before/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", {
        name: /download for android/i,
      }),
    ).toHaveLength(2);
  });

  it("renders footer links so support and legal routes never dead-end", async () => {
    const { default: HomePage } = await import("@/app/page");

    await renderRoute(
      <>
        <HomePage />
        <SiteFooter />
      </>,
    );

    const footerNavigation = screen.getByRole("navigation", { name: /footer/i });

    expect(within(footerNavigation).getByRole("link", { name: /^download$/i })).toHaveAttribute(
      "href",
      "/download",
    );
    expect(within(footerNavigation).getByRole("link", { name: /privacy/i })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(within(footerNavigation).getByRole("link", { name: /support/i })).toHaveAttribute(
      "href",
      "/support",
    );
    expect(within(footerNavigation).getByRole("link", { name: /terms/i })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(within(footerNavigation).getByRole("link", { name: /official releases/i })).toHaveAttribute(
      "href",
      "https://github.com/jntellez/documind/releases",
    );
  });

  it("renders the download route with latest APK metadata when available", async () => {
    getReleaseMetadata.mockResolvedValue({
      version: "1.2.3",
      tagName: "v1.2.3",
      apkUrl:
        "https://github.com/jntellez/documind/releases/download/v1.2.3/documind-android-v1.2.3.apk",
      apkAssetName: "documind-android-v1.2.3.apk",
      publishedAt: "2026-06-01T12:00:00.000Z",
      source: "github",
      officialReleasesUrl: "https://github.com/jntellez/documind/releases",
    });

    const { default: DownloadPage } = await import("@/app/download/page");

    await renderRoute(await DownloadPage());

    expect(
      screen.getByRole("link", { name: /download for android/i }),
    ).toHaveAttribute(
      "href",
      "https://github.com/jntellez/documind/releases/download/v1.2.3/documind-android-v1.2.3.apk",
    );
    expect(screen.getByText(/version 1\.2\.3/i)).toBeInTheDocument();
  });

  it("renders legal and support routes with launch-ready content instead of dead-end placeholders", async () => {
    const { default: PrivacyPage } = await import("@/app/privacy/page");
    const { default: SupportPage } = await import("@/app/support/page");
    const { default: TermsPage } = await import("@/app/terms/page");

    const { rerenderAsync } = await renderRoute(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByText(/documind team/i)).toBeInTheDocument();
    expect(screen.getByText(/juantellez916@gmail.com/i)).toBeInTheDocument();

    await rerenderAsync(<SupportPage />);

    expect(screen.getByRole("heading", { level: 1, name: /^support$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /common android install blockers/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/support email: juantellez916@gmail.com/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /go to the official download page/i })[0]).toHaveAttribute(
      "href",
      "/download",
    );
    expect(screen.getByRole("link", { name: /open the official github releases page/i })).toHaveAttribute(
      "href",
      "https://github.com/jntellez/documind/releases",
    );

    await rerenderAsync(<TermsPage />);

    expect(screen.getByRole("heading", { name: /terms of service/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /ai-assisted features/i })).toBeInTheDocument();
    expect(screen.getByText(/practical first public version/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /contact support/i })[0]).toHaveAttribute(
      "href",
      "/support",
    );
  });

  it("renders a trusted fallback message when the latest APK cannot be resolved", async () => {
    getReleaseMetadata.mockResolvedValue(null);

    const { default: DownloadPage } = await import("@/app/download/page");

    await renderRoute(await DownloadPage());

    expect(
      screen.getByText(/latest apk is temporarily unavailable/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /browse official releases/i }),
    ).toHaveAttribute("href", "https://github.com/jntellez/documind/releases");
  });
});
