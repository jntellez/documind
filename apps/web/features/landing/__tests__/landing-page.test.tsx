import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LandingPage } from "@/features/landing/components/landing-page";
import { landingContent } from "@/features/landing/content";
import { SiteFooter } from "@/features/site/components/site-footer";
import { renderAsync } from "@/test/render";

const release = {
  version: "1.0.0",
  tagName: "v1.0.0",
  apkUrl: "https://github.com/jntellez/documind/releases/download/v1.0.0/documind-android-v1.0.0.apk",
  apkAssetName: "documind-android-v1.0.0.apk",
  publishedAt: "2026-06-06T12:00:00.000Z",
  fileSizeBytes: 45_000_000,
  source: "github" as const,
  officialReleasesUrl: "https://github.com/jntellez/documind/releases",
};

describe("LandingPage", () => {
  it("renders a simple header nav and keeps repeated download paths available across the page", async () => {
    await renderAsync(<LandingPage release={release} />);

    const primaryNavigation = screen.getByRole("navigation", {
      name: /primary/i,
    });

    expect(within(primaryNavigation).getByRole("link", { name: /features/i })).toHaveAttribute(
      "href",
      "#showcase",
    );
    expect(within(primaryNavigation).getByRole("link", { name: /how it works/i })).toHaveAttribute(
      "href",
      "#start",
    );
    expect(within(primaryNavigation).getByRole("link", { name: /faq/i })).toHaveAttribute(
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
        name: new RegExp(landingContent.downloadCta.label, "i"),
      }),
    ).toHaveLength(1);
    expect(screen.getByRole("link", { name: /download apk/i })).toHaveAttribute("href", "/download");
  });

  it("renders the trust strip as compact metadata and anchors later sections for header navigation", async () => {
    await renderAsync(<LandingPage release={release} />);

    const trustList = screen.getByRole("list", {
      name: /trust highlights/i,
    });

    expect(within(trustList).getAllByRole("listitem")).toHaveLength(landingContent.trustItems.length);
    expect(within(trustList).getByText(/v1\.0\.0/i)).toBeInTheDocument();
    expect(within(trustList).getByText(/jun 6, 2026/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /start in minutes/i })).toHaveAttribute("id", "start");
    expect(screen.getByRole("heading", { name: /frequently asked questions/i })).toHaveAttribute(
      "id",
      "faq",
    );
  });

  it("exposes the hero as a labeled region with isolated copy and action groups before the trust strip", async () => {
    await renderAsync(<LandingPage release={release} />);

    const heroRegion = screen.getByRole("region", {
      name: /interact with your documents like never before/i,
    });

    expect(within(heroRegion).getByLabelText(/hero copy/i)).toBeInTheDocument();

    const actionGroup = within(heroRegion).getByRole("group", {
      name: /hero actions/i,
    });

    expect(within(actionGroup).getAllByRole("link")).toHaveLength(2);
    expect(within(heroRegion).getByLabelText(/hero media/i)).toBeInTheDocument();

    const trustList = screen.getByRole("list", { name: /trust highlights/i });
    expect(heroRegion.nextElementSibling).toContainElement(trustList);
  });

  it("keeps the hero media isolated from the header while preserving both hero CTA destinations", async () => {
    await renderAsync(<LandingPage release={release} />);

    const heroRegion = screen.getByRole("region", {
      name: /interact with your documents like never before/i,
    });

    const actionGroup = within(heroRegion).getByRole("group", {
      name: /hero actions/i,
    });

    expect(within(actionGroup).getByRole("link", { name: /download for android/i })).toHaveAttribute(
      "href",
      "/download",
    );
    expect(within(actionGroup).getByRole("link", { name: /see how it works/i })).toHaveAttribute(
      "href",
      "#showcase",
    );

    const heroMedia = within(heroRegion).getByLabelText(/hero media/i);
    expect(within(heroMedia).getByRole("img", { name: /documind home library screen/i })).toBeInTheDocument();
    expect(screen.getByRole("banner")).not.toContainElement(within(heroMedia).getByRole("img", { name: /documind home library screen/i }));
  });

  it("renders the desktop showcase with approved proof points from the marketing assets", async () => {
    await renderAsync(<LandingPage release={release} />);

    const desktopShowcase = screen.getByRole("list", {
      name: /desktop feature showcase/i,
    });

    const cards = within(desktopShowcase).getAllByRole("listitem");
    expect(cards).toHaveLength(landingContent.showcaseItems.length);

    expect(
      within(desktopShowcase).getByRole("heading", {
        name: /centralize your library/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(desktopShowcase).getByRole("heading", {
        name: /ai-powered conversations/i,
      }),
    ).toBeInTheDocument();
  });

  it("keeps the body copy aligned with the extracted mockup across feature and onboarding sections", async () => {
    await renderAsync(<LandingPage release={release} />);

    expect(
      screen.getAllByRole("heading", {
        name: /intelligent document reading/i,
      }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("heading", {
        name: /built for android/i,
      }),
    ).toHaveLength(2);

    expect(screen.getByRole("heading", { name: /^download$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^import$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^interact$/i })).toBeInTheDocument();
  });

  it("renders the mockup-aligned faq and final download CTA copy", async () => {
    await renderAsync(<LandingPage release={release} />);

    expect(
      screen.getByRole("heading", {
        name: /get the official documind app/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/download the official android build, verify the release source/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/download from documind\.app or the linked first-party github releases route/i)).toBeInTheDocument();
    expect(screen.getAllByText(/43 mb|45 mb/i).length).toBeGreaterThan(0);
  });

  it("renders a swipe-friendly mobile carousel with one accessible slide per showcase item", async () => {
    await renderAsync(<LandingPage release={release} />);

    const carousel = screen.getByRole("region", {
      name: /swipe through documind previews/i,
    });

    const slides = within(carousel).getAllByRole("group");
    expect(slides).toHaveLength(landingContent.showcaseItems.length);
    expect(within(slides[0]).getByText(/slide 1 of/i)).toBeInTheDocument();
    expect(within(slides.at(-1) as HTMLElement).getByText(/slide 4 of 4/i)).toBeInTheDocument();
  });

  it("adds framed media shells and subtle icon treatment across the header, hero, trust strip, FAQ, and CTAs", async () => {
    await renderAsync(<LandingPage release={release} />);

    expect(screen.getByTestId("hero-media-shell")).toBeInTheDocument();
    expect(screen.getByTestId("header-download-icon")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("hero-primary-cta-icon")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("final-cta-icon")).toHaveAttribute("aria-hidden", "true");

    const trustList = screen.getByRole("list", { name: /trust highlights/i });
    expect(within(trustList).getAllByTestId("trust-item-icon")).toHaveLength(landingContent.trustItems.length);
    expect(screen.getAllByTestId("faq-chevron")).toHaveLength(landingContent.faq.length);

    landingContent.showcaseItems.forEach((item) => {
      expect(screen.getAllByTestId(`showcase-media-shell-${item.id}`)).toHaveLength(2);
    });
  });

  it("renders the faq affordances and shared footer hooks used by the landing route", async () => {
    await renderAsync(
        <>
        <LandingPage release={release} />
        <SiteFooter />
      </>,
    );

    expect(screen.getAllByTestId("faq-chevron")).toHaveLength(landingContent.faq.length);
    expect(screen.getByTestId("faq-list")).toBeInTheDocument();
    expect(screen.getByTestId("footer-meta")).toBeInTheDocument();
    expect(screen.getByTestId("footer-nav")).toBeInTheDocument();
  });
});
