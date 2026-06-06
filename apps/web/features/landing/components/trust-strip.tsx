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
      <ul aria-label="Trust highlights" className="mx-auto grid w-full max-w-6xl gap-x-6 gap-y-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-0">
        {landingContent.trustItems.map((item) => {
          const fact = facts.find((entry) => entry.id === item.id);
          const suffix = fact?.value ? `${item.label === "Secure APK" ? " " : ": "}${fact.value}` : "";
          const displayText = fact?.value ? `${item.label}${suffix}` : item.label;

          return (
            <li className="flex min-w-0 list-none items-center gap-3 rounded-2xl" key={item.id}>
              <TrustIcon iconName={item.icon} />
              <p className="min-w-0 font-mono text-sm font-medium tracking-[-0.01em] text-slate-600">{displayText}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
