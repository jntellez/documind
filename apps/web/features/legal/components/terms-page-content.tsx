import Link from "next/link";

import type { LegalContentSection } from "@/features/legal/content";
import { termsPageContent } from "@/features/legal/content";
import { SecondaryPageHeader } from "@/features/site/components/secondary-page-header";

export function TermsPageContent() {
  return (
    <div className="marketing-page-shell">
      <SecondaryPageHeader currentPage="terms" />
      <main className="marketing-page-container">
        <div className="marketing-copy-container flex flex-col gap-8">
          <header className="space-y-4">
            <p className="marketing-eyebrow">{termsPageContent.eyebrow}</p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-[-0.03em] text-balance text-[#1c1b1b] sm:text-5xl">{termsPageContent.title}</h1>
            <div className="space-y-3">
              {termsPageContent.intro.map((paragraph) => (
                <p className="marketing-lead max-w-3xl text-sm leading-7 sm:text-base sm:leading-8" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </header>
          <section className="grid gap-4">
            {(termsPageContent.sections as readonly LegalContentSection[]).map((section) => (
              <article className="marketing-surface p-6 sm:p-8" key={section.title}>
                <h2 className="text-xl font-semibold text-[#1c1b1b]">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs?.map((paragraph) => (
                    <p className="marketing-lead text-sm leading-7 sm:text-base" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets?.length ? (
                    <ul className="space-y-3">
                      {section.bullets.map((item) => (
                        <li className="marketing-lead flex gap-3 text-sm leading-7 sm:text-base" key={item}>
                          <span aria-hidden="true" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#003ec7]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {section.links?.length ? (
                    <div className="flex flex-wrap gap-3 pt-1">
                      {section.links.map((link) => (
                        <Link className="font-medium text-[#003ec7] transition hover:text-[#0038b6]" href={link.href} key={link.href}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
          <div className="flex flex-wrap gap-4">
            <Link className="marketing-primary-button w-full sm:w-auto" href={termsPageContent.cta.primary.href}>
              {termsPageContent.cta.primary.label}
            </Link>
            <Link className="marketing-secondary-button w-full sm:w-auto" href={termsPageContent.cta.secondary.href}>
              {termsPageContent.cta.secondary.label}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
