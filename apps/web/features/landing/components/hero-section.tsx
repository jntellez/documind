import Link from "next/link";

import { landingContent } from "@/features/landing/content";

import { LandingIcon } from "./landing-icons";
import { HeroMedia } from "./hero-media";

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:gap-12 lg:px-6 lg:py-14">
      <div aria-label="Hero copy" className="w-full text-center lg:flex-1 lg:text-left">
        <h1 className="text-[2.5rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-balance sm:text-[3.5rem] lg:text-[64px]" id="hero-title">
          {landingContent.hero.title}
        </h1>
        <p className="mx-auto mt-5 max-w-[32rem] text-base leading-7 text-[#54647a] text-pretty sm:mt-6 sm:text-[1.125rem] sm:leading-8 lg:mx-0 lg:max-w-[34rem]">
          {landingContent.hero.description}
        </p>
        <div aria-label="Hero actions" className="mt-6 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:mt-10 lg:justify-start" role="group">
          <Link
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#003ec7] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(0,62,199,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0038b6] hover:shadow-[0_16px_34px_rgba(0,62,199,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003ec7] sm:min-w-[15.25rem] sm:w-auto sm:px-8 sm:py-3.5 sm:text-[1rem]"
            href={landingContent.downloadCta.href}
          >
            <LandingIcon testId="hero-primary-cta-icon" />
            {landingContent.downloadCta.label}
          </Link>
          <Link
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#c3c5d9] bg-white px-6 py-3 text-sm font-medium text-[#1c1b1b] shadow-[0_8px_18px_rgba(28,27,27,0.04)] transition hover:bg-[#f6f3f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#737688] sm:min-w-[13.75rem] sm:w-auto sm:px-8 sm:py-3.5 sm:text-[1rem]"
            href={landingContent.downloadCta.secondaryHref}
          >
            {landingContent.downloadCta.secondaryLabel}
          </Link>
        </div>
      </div>

      <div aria-label="Hero media" className="hidden w-full justify-center lg:flex lg:w-auto lg:justify-end">
        <HeroMedia />
      </div>
    </section>
  );
}
