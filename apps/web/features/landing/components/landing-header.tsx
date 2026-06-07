"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { landingContent } from "@/features/landing/content";

import { LandingIcon } from "./landing-icons";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-stone-200/80 bg-white/95">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-6">
        <Link className="text-2xl font-bold -tracking-wide text-blue-600" href="/">
          Documind
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-medium text-slate-500 lg:flex">
          {landingContent.headerNav.map((item) => (
            <Link className="transition hover:text-slate-900" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-blue-700 bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            href={landingContent.downloadCta.href}
          >
            <LandingIcon testId="header-download-icon" />
            Download
          </Link>

          <button
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 transition hover:text-slate-900 lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav aria-label="Mobile primary" className="border-t border-stone-200/80 bg-white/95 px-4 py-4 sm:px-6 lg:hidden">
          <ul className="space-y-3">
            {landingContent.headerNav.map((item) => (
              <li key={item.href}>
                <Link
                  className="block rounded-md px-3 py-2 text-base font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
