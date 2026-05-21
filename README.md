<div align="center">

# Documind

<img src="./assets/images/readme-cover.webp" alt="Documind" />

Document ingestion and chat platform with an Expo mobile app and a Bun API.

</div>

## Stack

- **Monorepo** — [pnpm](https://pnpm.io/workspaces)
- **Mobile** — [Expo](https://expo.dev), [React Native](https://reactnative.dev), [TypeScript](https://www.typescriptlang.org)
- **API** — [Bun](https://bun.sh), [Hono](https://hono.dev), [PostgreSQL](https://www.postgresql.org)
- **Auth** — Google + GitHub OAuth
- **Data** — document storage, chat history, offline-first sync, and local [SQLite](https://www.sqlite.org) via [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)

## Monorepo

- `apps/mobile` — Expo app for reading, saving, and chatting with documents
- `apps/api` — Bun API for auth, ingestion, persistence, and chat endpoints
- `packages` — shared workspace packages

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Create local env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

3. Start the API:

```bash
pnpm api:dev
```

4. In another terminal, start the mobile app:

```bash
pnpm mobile:start
```

5. Open the Expo target you want:

```bash
pnpm mobile:android
# or
pnpm mobile:ios
# or
pnpm mobile:web
```

## Scripts

```bash
pnpm mobile:start
pnpm mobile:android
pnpm mobile:ios
pnpm mobile:web

pnpm api:dev
pnpm api:start

pnpm typecheck
pnpm validate
pnpm test
```

## Docker

Run the API and PostgreSQL locally with Docker:

```bash
pnpm docker:up
pnpm docker:logs
pnpm docker:down
```

## License

[MIT](LICENSE)
