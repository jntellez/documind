import { getPrivacyPolicyDocument } from "@/features/legal/server/privacy-policy";
import { SecondaryPageHeader } from "@/features/site/components/secondary-page-header";

type PrivacyPageContentProps = {
  policy: ReturnType<typeof getPrivacyPolicyDocument>;
};

export function PrivacyPageContent({ policy }: PrivacyPageContentProps) {

  return (
    <div className="marketing-page-shell">
      <SecondaryPageHeader currentPage="privacy" />
      <main className="marketing-page-container">
        <div className="marketing-copy-container flex flex-col gap-8">
          <header className="space-y-4">
            <p className="marketing-eyebrow">Legal</p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-[-0.03em] text-balance text-[#1c1b1b] sm:text-5xl">{policy.title}</h1>
            <p className="marketing-lead max-w-3xl text-sm leading-7 sm:text-base sm:leading-8">
              {policy.intro[0]}
            </p>
            {policy.lastUpdated ? <p className="marketing-lead text-sm">Last updated: {policy.lastUpdated}</p> : null}
          </header>

          <section className="grid gap-4">
            {policy.sections.map((section) => (
              <article key={section.title} className="marketing-surface p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-[#1c1b1b]">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p className="marketing-lead text-sm leading-7 sm:text-base" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}

                  {section.subsections.map((subsection) => (
                    <div className="space-y-2" key={subsection.title}>
                      <h3 className="text-base font-semibold text-[#1c1b1b] sm:text-lg">{subsection.title}</h3>
                      {subsection.body.map((paragraph) => (
                        <p className="marketing-lead text-sm leading-7 sm:text-base" key={paragraph}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ))}

                  {section.bullets.length ? (
                    <ul className="space-y-3">
                      {section.bullets.map((bullet) => (
                        <li className="marketing-lead flex gap-3 text-sm leading-7 sm:text-base" key={bullet}>
                          <span aria-hidden="true" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#003ec7]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
