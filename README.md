# Documind

Documind is a pnpm monorepo with two active apps:

- `apps/mobile`: Expo / React Native / TypeScript client
- `apps/api`: Bun / Hono / TypeScript API

## Monorepo structure

```text
.
├── apps/
│   ├── api/      # Bun + Hono backend
│   └── mobile/   # Expo / React Native app
├── packages/     # shared packages (reserved)
├── package.json  # root scripts for the monorepo
└── pnpm-workspace.yaml
```

## Tooling model: pnpm + Bun

- **pnpm** manages the monorepo, installs dependencies, and runs workspace scripts.
- **Bun** is the runtime used by `apps/api`.
- In practice: you install everything from the repo root with `pnpm install`, and pnpm delegates API scripts to Bun where needed.

## Prerequisites

- Node.js 18+
- pnpm 10+
- Bun 1.x
- iOS Simulator / Android Studio if you want native Expo targets

## Install dependencies

From the repository root:

```bash
pnpm install
```

To verify the workspace layout detected by pnpm:

```bash
pnpm --recursive list --depth -1
```

## Root scripts

### Mobile

```bash
pnpm mobile:start
pnpm mobile:android
pnpm mobile:ios
pnpm mobile:web
pnpm mobile:typecheck
pnpm mobile:config
```

Convenience aliases kept at root:

```bash
pnpm start
pnpm android
pnpm ios
pnpm web
```

These aliases map to the mobile app.

### API

```bash
pnpm api:dev
pnpm api:start
pnpm api:typecheck
```

### Docker local development

The mobile app stays outside Docker. Docker support is only for the API and PostgreSQL.

```bash
cp apps/api/.env.example apps/api/.env
pnpm docker:up
```

Helpful commands:

```bash
pnpm docker:logs
pnpm docker:down
```

This starts:

- `postgres` on `localhost:5432` with a persistent Docker volume
- `api` on `localhost:3000`, connected to the `postgres` service by Compose hostname

On a brand new Postgres Docker volume, Compose now runs `docker/postgres/init/001-documind-schema.sql` automatically to create the local `users` and `documents` tables the API queries expect.

When running the API inside Docker, keep `DATABASE_URL` pointed at `postgres` in `apps/api/.env`. If you run the API directly on your host with `pnpm api:dev`, switch to the commented `localhost` example instead.

If you already have an existing `postgres-data` volume, the init script will not rerun automatically. Recreate the volume (for example with `docker compose down -v`) if you need the bootstrap SQL applied to a fresh local database.

### Cross-workspace validation

```bash
pnpm typecheck
pnpm validate
```

- `pnpm typecheck` runs the mobile and API typechecks.
- `pnpm validate` runs both typechecks plus a lightweight Expo config validation.

## Running the mobile app

From the repo root:

```bash
pnpm mobile:start
```

`pnpm mobile:start` (and the `mobile:ios`, `mobile:android`, `mobile:web` variants)
automatically detects your current LAN IPv4 and writes
`apps/mobile/.env.development.local` with `EXPO_PUBLIC_API_URL=http://<lan-ip>:<port>`
for local development. This keeps physical devices like iPhones pointed at the
current machine without manually editing env files after network changes.

Or use a platform-specific target:

```bash
pnpm mobile:android
pnpm mobile:ios
pnpm mobile:web
```

You can also run the workspace directly:

```bash
pnpm --filter @documind/mobile start
```

## Mobile environment configuration

The mobile app environment files live under `apps/mobile/`.

- Example template: `apps/mobile/.env.example`
- Local real env file: `apps/mobile/.env` (local only, not committed)

Typical setup:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Then fill in the Expo public variables locally:

- `EXPO_PUBLIC_API_URL` (optional; if unset, the start scripts auto-generate a development value)
- `EXPO_PUBLIC_GOOGLE_ANDROID_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_ID`
- `EXPO_PUBLIC_GITHUB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_REDIRECT_URI`

Notes:

- The generated development file is `apps/mobile/.env.development.local` and is ignored by git.
- Any explicit `EXPO_PUBLIC_API_URL` you set in your shell or local env files still wins; the auto-generated file is removed in that case.
- `EXPO_PUBLIC_API_PORT` can still be set locally if your API does not run on port `3000`.

## Running the API

From the repo root:

```bash
pnpm api:dev
```

Or run the Bun entrypoint without hot reload:

```bash
pnpm api:start
```

Direct workspace form:

```bash
pnpm --filter @documind/api dev
```

## API environment configuration

The API environment files live under `apps/api/`.

- Example template: `apps/api/.env.example`
- Local real env file: `apps/api/.env` (local only, not committed)

Typical setup:

```bash
cp apps/api/.env.example apps/api/.env
```

Then fill in the required values locally. Do not commit secrets.

## Quick validation flow

From the repo root:

```bash
pnpm typecheck
pnpm mobile:config
```

For the API, a lightweight runtime validation can be done by starting it briefly with Bun from `apps/api` using the local `.env`.

## Tech stack

- Expo SDK 54
- React Native 0.81
- TypeScript 5.9
- Hono
- Bun
- pnpm workspaces

## License

This project is open source and available under the [MIT License](LICENSE).
