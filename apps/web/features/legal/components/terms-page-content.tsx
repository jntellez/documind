import Link from "next/link";

import { termsPlaceholder } from "@/features/legal/content";

export function TermsPageContent() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-20">
        <h1 className="text-4xl font-semibold">{termsPlaceholder.title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-300">{termsPlaceholder.summary}</p>
        <p className="max-w-2xl text-sm leading-7 text-slate-300">{termsPlaceholder.followUp}</p>
        <div className="flex flex-wrap gap-4">
          <Link className="text-cyan-300 hover:text-cyan-200" href="/support">
            Contact support
          </Link>
          <Link className="text-cyan-300 hover:text-cyan-200" href="/privacy">
            Review privacy policy
          </Link>
        </div>
      </main>
    </div>
  );
}
