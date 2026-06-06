---
name: documind-web
description: >
  Project guidance for the official Documind web landing under apps/web using Next.js,
  TypeScript, and Tailwind CSS. Trigger: When the task touches apps/web, landing page
  UI, marketing assets, metadata/SEO, responsive web layouts, or GitHub Releases-backed
  Android download flows.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Any change under `apps/web`
- Landing page sections, responsive marketing layouts, or CTA flows
- Download metadata, GitHub Releases integration, or APK distribution messaging
- SEO, metadata, social preview, sitemap, or web route work
- Tailwind styling, app-router composition, or asset presentation for the official site

## Critical Patterns

- Keep official landing work inside `apps/web` unless the task explicitly requires shared docs, root scripts, or release metadata wiring.
- Use Next.js App Router, TypeScript, and Tailwind CSS as the default web stack.
- Reuse assets from `assets/marketing/**` instead of regenerating placeholders during implementation.
- Treat GitHub Releases as the canonical APK source for v1; UI metadata must degrade gracefully if remote fetches fail.
- Keep the site product-first: clear Android download CTA, trust signals, and responsive behavior aligned with the approved mockups.
- Favor static/edge-friendly rendering for marketing content; isolate any release metadata fetch logic behind a small server-side boundary.
- Preserve accessibility basics: semantic headings, keyboard-safe controls, alt text, visible focus states, and sufficient color contrast.
- Keep motion subtle and optional; avoid heavy animation that hurts readability or performance.
- Validate the web workspace with the smallest correct command, then widen to workspace validation only when changes cross workspaces.

## Code Examples

```tsx
// Good: keep landing sections small, composable, and typed.
type SectionProps = {
  title: string;
  description: string;
};

export function LandingSection({ title, description }: SectionProps) {
  return (
    <section aria-labelledby={title}>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
```

## Commands

```bash
pnpm install
pnpm --filter @documind/web dev
pnpm --filter @documind/web typecheck
pnpm --filter @documind/web test
pnpm --filter @documind/web lint
pnpm validate
```

## Resources

- **Assets**: `assets/marketing/`
- **Project guidance**: `AGENTS.md`
- **Landing mockups**: `stich/`
