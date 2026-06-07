import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { siteConfig } from "@/features/site/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white text-slate-500">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-4 text-center text-xs sm:items-start sm:text-left sm:gap-8 sm:px-6 sm:py-5 sm:text-[0.72rem] lg:px-8">
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-x-5" data-testid="footer-meta">
          <Link className="text-sm font-bold text-slate-900 transition hover:text-blue-600 sm:text-base" href="/">
            {siteConfig.name}
          </Link>

          <nav aria-label="Footer" data-testid="footer-nav">
            <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 sm:justify-end sm:gap-x-5">
              {siteConfig.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link className="text-xs transition hover:text-slate-900 sm:text-sm" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="text-xs transition hover:text-slate-900 sm:text-sm" href={siteConfig.officialReleasesUrl}>
                  Official releases
                </Link>
              </li>
            </ul>
          </nav>

          <a className="flex items-center gap-1 text-xs transition hover:text-slate-900 sm:text-sm" href={`https://github.com/${siteConfig.developerUser}`} rel="noopener noreferrer" target="_blank">
            {siteConfig.developerUser} {siteConfig.copyrightYear}
            <ArrowUpRight size={12} className="sm:size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
