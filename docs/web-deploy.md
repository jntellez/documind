# Web Deployment — `apps/web`

The production landing is deployed from `apps/web` by Vercel's native Git integration.

## Quick path

1. Connect the repository to Vercel and set the root directory to `apps/web`.
2. Configure the production domain and production environment variables in Vercel.
3. Push to `master` and let Vercel build and publish the new production version automatically.

## Runtime environment

`apps/web/.env.example` documents the only public runtime variable currently expected by the landing:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GITHUB_REPOSITORY` | `jntellez/documind` | Points the landing at the canonical GitHub Releases repository. |

If the public Android release assets remain in this repository, Vercel can keep the default value.

## Vercel project settings

Use these settings in the Vercel project:

| Setting | Value |
|---|---|
| Framework preset | `Next.js` |
| Root directory | `apps/web` |
| Install command | `pnpm install` |
| Build command | `pnpm --filter @documind/web build` |
| Output directory | `.next` |

## Release behavior

The landing fetches the latest GitHub Release metadata at runtime and revalidates every 15 minutes.

- Tag format: `v{version}`
- APK asset format: `documind-android-v{version}.apk`
- Canonical fallback: the GitHub Releases index page, not a seeded APK URL

This means a new Android release does **not** require a manual web redeploy as long as the new GitHub Release follows the contract above.

## Checklist

- [ ] Vercel project root directory is `apps/web`
- [ ] Production domain is attached
- [ ] `NEXT_PUBLIC_GITHUB_REPOSITORY` is correct in Vercel production env
- [ ] Vercel has completed at least one successful production deploy from `master`

## Next step

After the first successful production deploy, use `docs/release-checklist.md` for each Android release.
