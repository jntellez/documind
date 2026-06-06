import Link from "next/link";

import { supportChecklist } from "@/features/legal/content";
import { siteConfig } from "@/features/site/config";

export function SupportPageContent() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-20">
        <h1 className="text-4xl font-semibold">Support</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Need installation help or want to verify the official Android build path? This support route is the first-party destination for launch guidance.
        </p>
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Install and verification</h2>
          <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
            {supportChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            You can also verify the APK directly on the official GitHub Releases page: {siteConfig.officialReleasesUrl}
          </p>
          <p className="text-sm leading-7 text-slate-300">Contact: {siteConfig.supportEmail}</p>
        </section>
        <Link className="mt-6 inline-block text-cyan-300 hover:text-cyan-200" href="/download">
          Go to the official download page
        </Link>
      </main>
    </div>
  );
}
