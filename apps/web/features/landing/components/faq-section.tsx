import { landingContent } from "@/features/landing/content";

import { FaqChevronIcon } from "./landing-icons";

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 lg:py-24">
      <h2 className="text-center text-[1.75rem] font-semibold tracking-[-0.02em]" id="faq">
        Frequently Asked Questions
      </h2>
      <div className="mt-10 space-y-4" data-testid="faq-list">
        {landingContent.faq.map((item) => (
          <details key={item.question} className="group rounded-[1.5rem] border border-[#d9dce5] bg-white px-6 py-5 shadow-[0_8px_18px_rgba(28,27,27,0.04)]" name="faq">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.125rem] font-semibold tracking-[-0.01em] text-[#1c1b1b]">
              <span>{item.question}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d9dce5] bg-[#fcf9f8] text-[#54647a] transition group-open:rotate-180 group-open:bg-[#dde1ff] group-open:text-[#0038b6]">
                <FaqChevronIcon />
              </span>
            </summary>
            <div className="mt-5 border-t border-[#ece9e8] pt-5">
              <p className="text-[1rem] leading-7 text-[#54647a] text-pretty">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
