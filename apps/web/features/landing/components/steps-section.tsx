import { landingContent } from "@/features/landing/content";

export function StepsSection() {
  return (
    <section className="border-y border-[#c3c5d9]/50 bg-white py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">
        <h2 className="text-center text-[1.75rem] font-semibold tracking-[-0.02em]" id="start">
          Start in Minutes
        </h2>
        <ol className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
          {landingContent.steps.map((item) => (
            <li key={item.step} className="list-none rounded-[1.5rem] border border-[#d9dce5] bg-[#fcf9f8] px-6 py-8 text-center shadow-[0_10px_24px_rgba(28,27,27,0.04)]">
              <p className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#dde1ff] text-3xl font-semibold text-[#0038b6]">{item.step}</p>
              <h3 className="mt-6 text-[1.125rem] font-semibold tracking-[-0.01em]">{item.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-6 text-[#54647a] text-pretty">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
