import Image from "next/image";

import { getShowcaseSlideLabel, landingContent } from "@/features/landing/content";

export function ShowcaseSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-10 lg:py-28" id="showcase">
      <ul aria-label="Desktop feature showcase" className="hidden gap-28 lg:grid">
        {landingContent.showcaseItems.map((item, index) => (
          <li key={item.id} className="list-none">
            <article className={`grid items-center gap-14 ${index % 2 === 0 ? "lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]"}`}>
              <div className={index % 2 === 0 ? "lg:order-1" : "lg:order-2"}>
                <div className="rounded-3xl shadow-xl" data-testid={`showcase-media-shell-${item.id}`}>
                  <Image alt={item.imageAlt} className="h-auto w-full rounded-3xl" loading="lazy" sizes="(min-width: 1024px) 360px, 100vw" src={item.image} />
                </div>
              </div>
              <div className={index % 2 === 0 ? "lg:order-2" : "lg:order-1"}>
                <p className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-[#54647a]">{item.eyebrow}</p>
                <h2 className="mt-3 max-w-md text-[1.75rem] font-semibold tracking-[-0.02em] leading-[1.25] text-balance lg:text-[1.9rem] lg:leading-[1.2]">{item.title}</h2>
                <p className="mt-4 max-w-md text-[1.125rem] leading-7 text-[#54647a] text-pretty">{item.description}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <section aria-label="Swipe through Documind previews" className="lg:hidden">
        <ol className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [touch-action:pan-y] sm:-mx-6 sm:px-6">
          {landingContent.showcaseItems.map((item, index) => (
            <li aria-label={item.title} className="min-w-[84%] snap-center list-none" key={item.id} role="group">
              <article className="h-full rounded-[1.75rem] border border-[#d9dce5] bg-white p-5 shadow-[0_14px_28px_rgba(28,27,27,0.05)]">
                <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.08em] text-[#54647a]">{getShowcaseSlideLabel(index, landingContent.showcaseItems.length)}</p>
                <div className="mt-4 shadow-xl" data-testid={`showcase-media-shell-${item.id}`}>
                  <Image
                    alt={item.imageAlt}
                    className={item.presentation === "soft-frame" ? "h-auto w-full rounded-[1.2rem]" : "mx-auto h-auto w-full max-w-[220px] drop-shadow-[0_16px_24px_rgba(28,27,27,0.11)]"}
                    loading="lazy"
                    sizes="84vw"
                    src={item.image}
                  />
                </div>
                <p className="mt-5 font-mono text-[0.72rem] font-medium uppercase tracking-[0.08em] text-[#54647a]">{item.eyebrow}</p>
                <h2 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.02em] leading-[1.15] text-balance">{item.title}</h2>
                <p className="mt-3 text-[1rem] leading-7 text-[#54647a] text-pretty">{item.description}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
