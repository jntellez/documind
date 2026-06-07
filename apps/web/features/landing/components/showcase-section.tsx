"use client";

import { useState } from "react";
import Image from "next/image";

import { landingContent } from "@/features/landing/content";

export function ShowcaseSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-6 lg:py-24" id="showcase">
      <ul aria-label="Desktop feature showcase" className="hidden gap-14 md:grid lg:gap-28">
        {landingContent.showcaseItems.map((item, index) => (
          <li key={item.id} className="list-none">
            <article className={`grid items-center gap-10 md:gap-14 ${index % 2 === 0 ? "md:grid-cols-[minmax(0,340px)_minmax(0,1fr)]" : "md:grid-cols-[minmax(0,1fr)_minmax(0,340px)]"}`}>
              <div className={index % 2 === 0 ? "md:order-1" : "md:order-2"}>
                <div className="rounded-3xl shadow-xl" data-testid={`showcase-media-shell-${item.id}`}>
                  <Image alt={item.imageAlt} className="h-auto w-full rounded-3xl" loading="lazy" sizes="(min-width: 768px) 340px, 100vw" src={item.image} />
                </div>
              </div>
              <div className={index % 2 === 0 ? "md:order-2" : "md:order-1"}>
                <p className="font-mono text-[clamp(0.68rem,2vw,0.75rem)] font-medium uppercase tracking-[0.08em] text-[#54647a]">{item.eyebrow}</p>
                <h2 className="mt-2 max-w-md text-[clamp(1.5rem,4vw,1.75rem)] font-semibold tracking-[-0.02em] leading-[1.25] text-balance sm:mt-3 md:text-[1.9rem] md:leading-[1.2]">{item.title}</h2>
                <p className="mt-3 max-w-md text-base leading-7 text-[#54647a] text-pretty sm:text-[1.125rem]">{item.description}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <section aria-label="App preview carousel" className="md:hidden -mx-4 sm:-mx-6">
        <div className="relative">
          <ol
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-6"
            onScroll={(e) => {
              const container = e.currentTarget;
              const scrollLeft = container.scrollLeft;
              const itemWidth = container.scrollWidth / landingContent.carouselImages.length;
              const newIndex = Math.round(scrollLeft / itemWidth);
              if (newIndex !== activeSlide) {
                setActiveSlide(newIndex);
              }
            }}
          >
            {landingContent.carouselImages.map((img, index) => (
              <li className="min-w-[88%] snap-center list-none sm:min-w-[86%]" key={index}>
                <div className="rounded-3xl shadow-xl overflow-hidden">
                  <Image
                    alt={img.alt}
                    className="h-auto w-full"
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="88vw"
                    src={img.src}
                  />
                </div>
              </li>
            ))}
          </ol>

          <div className="flex justify-center gap-2 pt-2" aria-label="Carousel indicators">
            {landingContent.carouselImages.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeSlide ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${index === activeSlide ? "w-6 bg-[#003ec7]" : "w-2 bg-[#c3c5d9]"}`}
                onClick={() => {
                  setActiveSlide(index);
                  const container = document.querySelector('[aria-label="App preview carousel"] ol');
                  if (container) {
                    const itemWidth = container.scrollWidth / landingContent.carouselImages.length;
                    container.scrollTo({ left: itemWidth * index, behavior: "smooth" });
                  }
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
