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
      <ul aria-label="Trust highlights" className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-3 px-4 py-4 sm:px-6 sm:py-5 lg:flex lg:items-center lg:justify-between lg:gap-x-12 lg:px-6">
        {landingContent.trustItems.map((item) => {
          const fact = facts.find((entry) => entry.id === item.id);
          const suffix = fact?.value ? `${item.label === "Secure APK" ? " " : ": "}${fact.value}` : "";
          const displayText = fact?.value ? `${item.label}${suffix}` : item.label;

          return (
            <li className="flex min-w-0 list-none items-center gap-2" key={item.id}>
              <TrustIcon iconName={item.icon} />
              <p className="min-w-0 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-slate-600 sm:text-xs">{displayText}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
