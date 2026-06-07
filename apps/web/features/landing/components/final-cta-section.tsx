import Link from "next/link";

import { landingContent } from "@/features/landing/content";
import { getCompactReleaseSummary } from "@/features/landing/release-facts";
import type { ReleaseMetadata } from "@/lib/releases/types";

import { LandingIcon } from "./landing-icons";

type FinalCtaSectionProps = {
  release?: ReleaseMetadata | null;
};

export function FinalCtaSection({ release = null }: FinalCtaSectionProps) {
  const compactSummary = getCompactReleaseSummary(release);

  return (
    <section className="border-t border-[#c3c5d9]/50 bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-4 text-center sm:gap-5 sm:px-6">
        <h2 className="text-[clamp(1.875rem,5vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.12] text-balance sm:text-4xl lg:text-[3rem]">
          {landingContent.finalCta.title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-[#54647a] text-pretty sm:text-[1.125rem]">
          {landingContent.finalCta.description}
        </p>
        <Link className="mt-1 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#003ec7] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(0,62,199,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0038b6] hover:shadow-[0_14px_28px_rgba(0,62,199,0.26)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003ec7] sm:mt-2 sm:min-h-12 sm:px-10 sm:py-4 sm:text-[1.125rem]" href={landingContent.downloadCta.href}>
          <LandingIcon testId="final-cta-icon" />
          Download APK
        </Link>

        {compactSummary.length ? (
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1.5 text-sm font-medium text-[#54647a]">
            {compactSummary.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
        ) : (
          <p className="text-sm font-medium text-[#54647a]">Latest release details sync automatically from the official GitHub Releases feed.</p>
        )}
      </div>
    </section>
  );
}
