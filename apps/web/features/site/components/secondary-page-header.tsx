import Link from "next/link";

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
  return (
    <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link className="text-2xl font-bold -tracking-wide text-blue-600" href="/">
          {siteConfig.name}
        </Link>

        <nav aria-label="Secondary" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500 sm:gap-x-5">
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
      </div>
    </header>
  );
}
