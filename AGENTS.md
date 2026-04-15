# Documind Agent Guide

## Project overview

Documind is a pnpm monorepo with two active applications:

- `apps/mobile`: Expo + React Native + TypeScript client
- `apps/api`: Bun + Hono + TypeScript API

Use the root workspace scripts as the default entrypoint for installs, validation, and day-to-day commands.

## Repository structure

```text
.
├── apps/
│   ├── api/      # Bun + Hono backend
│   └── mobile/   # Expo / React Native app
├── packages/     # shared packages (reserved)
├── skills/       # project-local AI skills
├── AGENTS.md     # project-wide agent instructions
└── package.json  # canonical root scripts
```

## Canonical commands

Run from the repository root unless a skill says otherwise.

| Purpose | Command |
|---|---|
| Install dependencies | `pnpm install` |
| List workspace packages | `pnpm --recursive list --depth -1` |
| Start mobile dev server | `pnpm mobile:start` |
| Run mobile Android target | `pnpm mobile:android` |
| Run mobile iOS target | `pnpm mobile:ios` |
| Run mobile web target | `pnpm mobile:web` |
| Validate mobile types | `pnpm mobile:typecheck` |
| Validate Expo config | `pnpm mobile:config` |
| Start API in dev mode | `pnpm api:dev` |
| Start API without hot reload | `pnpm api:start` |
| Validate API types | `pnpm api:typecheck` |
| Validate both apps | `pnpm typecheck` |
| Validate workspace + Expo config | `pnpm validate` |

Convenience aliases `pnpm start`, `pnpm android`, `pnpm ios`, and `pnpm web` map to the mobile app.

## Working agreements for agents

- Make the smallest change that satisfies the task.
- Do not commit or expose secrets, tokens, or `.env` contents.
- Keep edits scoped to the relevant app or project docs.
- Validate changed areas before finishing.
- Avoid unrelated refactors, renames, or formatting churn.
- Prefer root scripts over ad hoc workspace commands when both exist.

## Where changes belong

- Put Expo / React Native / UI / mobile TypeScript changes under `apps/mobile`.
- Put Bun / Hono / API / backend TypeScript changes under `apps/api`.
- Put project-wide AI guidance and reusable agent instructions under `AGENTS.md`, `skills/`, and `.atl/skill-registry.md`.
- Do not modify app source code when the task is only about AI/project guidance.

## Local skills

| Skill | Purpose | Path |
|---|---|---|
| `expo-mobile` | Guardrails for `apps/mobile` Expo/React Native work and validation | `skills/expo-mobile/SKILL.md` |
| `hono-api` | Guardrails for `apps/api` Bun/Hono work and environment handling | `skills/hono-api/SKILL.md` |
| `workspace-validation` | Chooses the right validation commands for changed files | `skills/workspace-validation/SKILL.md` |

## Recommended AI workflow

1. Read `README.md`, this file, and any relevant local skill.
2. Confirm the target area: `apps/mobile`, `apps/api`, or project docs/tooling.
3. Make a focused change with minimal blast radius.
4. Run the smallest validation that matches the edited files; use workspace-wide validation when changes cross app boundaries.
5. Before finishing, summarize files changed, validations run, and any remaining risks.
