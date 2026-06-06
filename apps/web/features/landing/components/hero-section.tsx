import Image from "next/image";
import Link from "next/link";

import { landingContent } from "@/features/landing/content";

import { LandingIcon } from "./landing-icons";

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="mx-auto flex max-w-6xl items-center justify-between gap-10 py-14">
      <div aria-label="Hero copy" className="max-w-1/2 w-full space-y-5 lg:space-y-7">
        <h1 className="w-full text-[64px] font-extrabold leading-[1.1] tracking-[-0.03em] text-balance" id="hero-title">
          {landingContent.hero.title}
        </h1>
        <p className="max-w-[35rem] text-[1.05rem] leading-7 text-[#54647a] text-pretty sm:text-[1.125rem] sm:leading-8 lg:max-w-[36rem] lg:text-[1.18rem]">
          {landingContent.hero.description}
        </p>
        <div aria-label="Hero actions" className="flex flex-col gap-4 pt-1 sm:flex-row sm:flex-wrap sm:items-center" role="group">
          <Link
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#003ec7] px-8 py-3.5 text-[1rem] font-medium text-white shadow-[0_12px_30px_rgba(0,62,199,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0038b6] hover:shadow-[0_16px_34px_rgba(0,62,199,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003ec7] sm:min-w-[15.25rem] sm:w-auto"
            href={landingContent.downloadCta.href}
          >
            <LandingIcon testId="hero-primary-cta-icon" />
            {landingContent.downloadCta.label}
          </Link>
          <Link
            className="inline-flex min-h-14 w-full items-center justify-center rounded-xl border border-[#c3c5d9] bg-white px-8 py-3.5 text-[1rem] font-medium text-[#1c1b1b] shadow-[0_8px_18px_rgba(28,27,27,0.04)] transition hover:bg-[#f6f3f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#737688] sm:min-w-[13.75rem] sm:w-auto"
            href={landingContent.downloadCta.secondaryHref}
          >
            {landingContent.downloadCta.secondaryLabel}
          </Link>
        </div>
      </div>

      <div aria-label="Hero media" className="flex w-full justify-end lg:justify-self-end">
        <div
          className="relative isolate w-full max-w-1/2 before:absolute before:left-1/2 before:top-[20%] before:h-40 before:w-40 before:-translate-x-1/2 before:rounded-full before:content-[''] after:absolute after:bottom-5 after:left-1/2 after:h-16 after:w-[72%] after:-translate-x-1/2 after:content-[''] lg:-translate-y-4"
          data-testid="hero-media-shell"
        >
          <Image
            alt={landingContent.hero.imageAlt}
            className="relative z-10 mx-auto h-auto w-full drop-shadow-[0_28px_46px_rgba(28,27,27,0.18)]"
            fetchPriority="high"
            priority
            src={landingContent.hero.image}
          />
          <div className="absolute top-1/2 right-3 h-100 w-100 -translate-y-1/2 rounded-full bg-blue-600/12 blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}
