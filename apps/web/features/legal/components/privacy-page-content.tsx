import { privacyPolicySections } from "@/features/legal/content";
import { siteConfig } from "@/features/site/config";

export function PrivacyPageContent() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-20">
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold">Privacy Policy</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-300">
            This route mirrors the current project privacy policy so visitors have a first-party legal destination during launch.
          </p>
        </header>

        <section className="grid gap-4">
          {privacyPolicySections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Documind Team</p>
          <p className="text-sm leading-7 text-slate-300">{siteConfig.supportEmail}</p>
        </section>
      </main>
    </div>
  );
}
