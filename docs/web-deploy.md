# Web Deployment — `apps/web`

The production landing is deployed from `apps/web` to Vercel.

## Quick path

1. Create a Vercel project that points to this repository and set the root directory to `apps/web`.
2. Add the required GitHub secrets so `.github/workflows/deploy-web.yml` can deploy production automatically.
3. Push to `master` or run **Deploy Web** manually from GitHub Actions.

## Required GitHub secrets

| Secret | Purpose |
|---|---|
| `VERCEL_TOKEN` | Authenticates the GitHub Actions workflow with Vercel. |
| `VERCEL_ORG_ID` | Selects the Vercel team or personal scope. |
| `VERCEL_PROJECT_ID` | Selects the production web project. |

## Runtime environment

`apps/web/.env.example` documents the only public runtime variable currently expected by the landing:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GITHUB_REPOSITORY` | `jntellez/documind` | Points the landing at the canonical GitHub Releases repository. |

If the public Android release assets remain in this repository, Vercel can keep the default value.

## Release behavior

The landing fetches the latest GitHub Release metadata at runtime and revalidates every 15 minutes.

- Tag format: `v{version}`
- APK asset format: `documind-android-v{version}.apk`
- Canonical fallback: the GitHub Releases index page, not a seeded APK URL

This means a new Android release does **not** require a web redeploy as long as the new GitHub Release follows the contract above.

## Checklist

- [ ] Vercel project root directory is `apps/web`
- [ ] Production domain is attached
- [ ] `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are configured in GitHub
- [ ] `NEXT_PUBLIC_GITHUB_REPOSITORY` is correct in Vercel production env
- [ ] `.github/workflows/deploy-web.yml` has completed successfully at least once

## Next step

After the first successful production deploy, use `docs/release-checklist.md` for each Android release.
