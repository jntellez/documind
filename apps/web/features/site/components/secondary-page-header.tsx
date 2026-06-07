"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { siteConfig } from "@/features/site/config";

type SecondaryPageHeaderProps = {
  currentPage: "download" | "privacy" | "support" | "terms";
};

const navItems = [
  { href: "/download", label: "Download", key: "download" },
  { href: "/privacy", label: "Privacy", key: "privacy" },
  { href: "/support", label: "Support", key: "support" },
  { href: "/terms", label: "Terms", key: "terms" },
] as const;

export function SecondaryPageHeader({ currentPage }: SecondaryPageHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-6">
        <Link className="text-2xl font-bold -tracking-wide text-blue-600" href="/">
          {siteConfig.name}
        </Link>

        <nav aria-label="Secondary" className="hidden items-center gap-6 text-sm font-medium text-slate-500 lg:flex">
          {navItems.map((item) => {
            const isCurrent = item.key === currentPage;

            return (
              <Link
                aria-current={isCurrent ? "page" : undefined}
                className={isCurrent ? "text-slate-950" : "transition hover:text-slate-900"}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-blue-700 bg-blue-700 px-4 text-sm font-medium text-white opacity-0 pointer-events-none" aria-hidden="true">
            Download
          </span>

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
        <nav aria-label="Mobile secondary" className="border-t border-stone-200/80 bg-white/95 px-4 py-4 sm:px-6 lg:hidden">
          <ul className="space-y-3">
            {navItems.map((item) => {
              const isCurrent = item.key === currentPage;

              return (
                <li key={item.href}>
                  <Link
                    className={`block rounded-md px-3 py-2 text-base font-medium transition hover:bg-slate-50 ${isCurrent ? "text-slate-950" : "text-slate-500 hover:text-slate-900"}`}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
