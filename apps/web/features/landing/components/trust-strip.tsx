import type { ReleaseMetadata } from "@/lib/releases/types";
import { landingContent } from "@/features/landing/content";
import { getLandingReleaseFacts } from "@/features/landing/release-facts";

import { TrustIcon } from "./landing-icons";

type TrustStripProps = {
  release?: ReleaseMetadata | null;
};

export function TrustStrip({ release = null }: TrustStripProps) {
  const facts = getLandingReleaseFacts(release);

  return (
    <section className="border-y border-[#c3c5d9]/60 bg-white/90">
      <ul aria-label="Trust highlights" className="mx-auto grid w-full max-w-6xl gap-3 py-4 sm:grid-cols-2 lg:grid-cols-4">
        {landingContent.trustItems.map((item) => {
          const fact = facts.find((entry) => entry.id === item.id);

          return (
            <li className="flex list-none items-start gap-3 rounded-2xl px-2 py-1.5" key={item.id}>
              <div className="mt-0.5 rounded-full bg-[#eef3ff] p-2 text-[#003ec7]">
                <TrustIcon iconName={item.icon} />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.08em] text-slate-600">{item.label}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#1c1b1b]">{fact?.value ?? fact?.fallbackValue}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
