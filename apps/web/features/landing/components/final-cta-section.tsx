import Link from "next/link";

import { landingContent } from "@/features/landing/content";

import { LandingIcon } from "./landing-icons";

export function FinalCtaSection() {
  return (
    <section className="border-t border-[#c3c5d9]/50 bg-white py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-4 text-center sm:px-6">
        <h2 className="text-[2.5rem] font-bold tracking-[-0.03em] leading-[1.12] text-balance lg:text-[3rem]">
          {landingContent.finalCta.title}
        </h2>
        <p className="max-w-2xl text-[1.125rem] leading-7 text-[#54647a] text-pretty">
          {landingContent.finalCta.description}
        </p>
        <Link className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#003ec7] px-10 py-4 text-[1.125rem] font-medium text-white shadow-[0_10px_24px_rgba(0,62,199,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0038b6] hover:shadow-[0_14px_28px_rgba(0,62,199,0.26)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003ec7]" href={landingContent.downloadCta.href}>
          <LandingIcon testId="final-cta-icon" />
          {landingContent.downloadCta.label}
        </Link>
      </div>
    </section>
  );
}
