---
name: hono-api
description: >
  Project guidance for changes inside apps/api using Bun, Hono, and TypeScript.
  Trigger: When the task touches apps/api, API routes, backend services, or Bun runtime code.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Any change under `apps/api`
- Hono route or middleware work
- Bun runtime or backend TypeScript updates

## Critical Patterns

- Keep API edits inside `apps/api` unless the task explicitly involves root docs or tooling.
- Match existing Bun + Hono + TypeScript conventions already present in the API workspace.
- Treat `apps/api/.env.example` as the template and `apps/api/.env` as local-only.
- Never commit secrets or copy real env values into docs, code, or tests.
- Prefer root commands for standard workflows.
- Validate API changes with `pnpm api:typecheck`.
- If env-related code changes are made, verify docs/examples still point to `apps/api/.env.example` rather than real secrets.

## Code Examples

```ts
// Good: keep handler code typed and local to the API workspace.
import { Hono } from 'hono';

const app = new Hono();
```

## Commands

```bash
pnpm api:dev
pnpm api:start
pnpm api:typecheck
```

## Resources

- **Documentation**: `README.md`, `apps/api/README.md`
- **Workspace**: `apps/api/package.json`
