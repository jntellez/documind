import { FaqSection } from "./faq-section";
import { FinalCtaSection } from "./final-cta-section";
import { HeroSection } from "./hero-section";
import { LandingHeader } from "./landing-header";
import { ShowcaseSection } from "./showcase-section";
import { StepsSection } from "./steps-section";
import { TrustStrip } from "./trust-strip";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b]">
      <LandingHeader />

      <main>
        <HeroSection />
        <TrustStrip />
        <ShowcaseSection />
        <StepsSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
    </div>
  );
}
