import { landingContent } from "@/features/landing/content";

export function StepsSection() {
  return (
    <section className="border-y border-[#c3c5d9]/50 bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">
        <h2 className="text-center text-[clamp(1.5rem,4vw,1.75rem)] font-semibold tracking-[-0.02em]" id="start">
          Start in Minutes
        </h2>
        <ol className="mx-auto mt-8 grid max-w-4xl gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3">
          {landingContent.steps.map((item) => (
            <li key={item.step} className="list-none rounded-[clamp(1rem,3vw,1.5rem)] border border-[#d9dce5] bg-[#fcf9f8] px-4 py-6 text-center shadow-[0_10px_24px_rgba(28,27,27,0.04)] sm:px-6 sm:py-8">
              <p className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#dde1ff] text-2xl font-semibold text-[#0038b6] sm:h-12 sm:w-12 sm:rounded-xl sm:text-3xl">{item.step}</p>
              <h3 className="mt-4 text-base font-semibold tracking-[-0.01em] sm:mt-6 sm:text-[1.125rem]">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-[#54647a] text-pretty sm:mt-2 sm:text-[0.95rem]">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
