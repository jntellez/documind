import Link from "next/link";

import { landingContent } from "@/features/landing/content";

import { LandingIcon } from "./landing-icons";

export function LandingHeader() {
  return (
    <header className="border-b border-stone-200/80 bg-white/95">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-0">
        <Link className="text-3xl font-bold -tracking-wide text-blue-600" href="/">
          Documind
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-5 text-sm font-medium text-slate-500 lg:gap-6">
          {landingContent.headerNav.map((item) => (
            <Link className="transition hover:text-slate-900" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-blue-700 bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          href={landingContent.downloadCta.href}
        >
          <LandingIcon testId="header-download-icon" />
          Download
        </Link>
      </div>
    </header>
  );
}
