import { landingContent } from "@/features/landing/content";

import { FaqChevronIcon } from "./landing-icons";

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
      <h2 className="text-center text-[clamp(1.5rem,4vw,1.75rem)] font-semibold tracking-[-0.02em]" id="faq">
        Frequently Asked Questions
      </h2>
      <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4" data-testid="faq-list">
        {landingContent.faq.map((item) => (
          <details key={item.question} className="group rounded-[clamp(1rem,3vw,1.5rem)] border border-[#d9dce5] bg-white px-4 py-4 shadow-[0_8px_18px_rgba(28,27,27,0.04)] sm:px-6 sm:py-5" name="faq">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold tracking-[-0.01em] text-[#1c1b1b] sm:text-[1.125rem]">
              <span>{item.question}</span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#d9dce5] bg-[#fcf9f8] text-[#54647a] transition group-open:rotate-180 group-open:bg-[#dde1ff] group-open:text-[#0038b6] sm:h-8 sm:w-8">
                <FaqChevronIcon />
              </span>
            </summary>
            <div className="mt-4 border-t border-[#ece9e8] pt-4 sm:mt-5 sm:pt-5">
              <p className="text-sm leading-7 text-[#54647a] text-pretty sm:text-[1rem]">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
