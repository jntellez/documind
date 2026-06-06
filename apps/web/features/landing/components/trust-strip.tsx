import { landingContent } from "@/features/landing/content";

import { TrustIcon } from "./landing-icons";

export function TrustStrip() {
  return (
    <section className="border-y border-[#c3c5d9]/60 bg-white/90">
      <ul aria-label="Trust highlights" className="mx-auto grid w-full max-w-6xl gap-2.5 py-4 font-mono text-[0.72rem] font-medium uppercase tracking-[0.08em] text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        {landingContent.trustItems.map((item) => (
          <li className="flex list-none items-center gap-2.5" key={item.id}>
            <TrustIcon iconName={item.icon} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
