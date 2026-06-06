import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { siteConfig } from "@/features/site/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 text-[0.72rem] sm:gap-8 lg:px-8">
        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1.5 sm:gap-x-5" data-testid="footer-meta">
          <Link className="text-base font-bold text-slate-900 transition hover:text-blue-600" href="/">
            {siteConfig.name}
          </Link>

          <nav aria-label="Footer" data-testid="footer-nav">
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 sm:justify-end sm:gap-x-5">
              {siteConfig.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link className="text-sm transition hover:text-slate-900" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="text-sm transition hover:text-slate-900" href={siteConfig.officialReleasesUrl}>
                  Official releases
                </Link>
              </li>
            </ul>
          </nav>

          <a className="flex items-center gap-1 text-sm transition hover:text-slate-900" href={`https://github.com/${siteConfig.developerUser}`} rel="noopener noreferrer" target="_blank">
            {siteConfig.developerUser} {siteConfig.copyrightYear}
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}
