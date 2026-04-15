---
name: workspace-validation
description: >
  Chooses the smallest correct validation commands for Documind changes.
  Trigger: When deciding what to run before finishing a task or reviewing edits across one or both workspaces.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Before finishing any change
- When edits span multiple workspaces
- When deciding between app-specific and workspace-wide validation

## Critical Patterns

| Changed files | Minimum validation |
|---|---|
| Only `apps/mobile/**` TypeScript/UI files | `pnpm mobile:typecheck` |
| `apps/mobile/app.json` or Expo config-related files | `pnpm mobile:typecheck` and `pnpm mobile:config` |
| Only `apps/api/**` TypeScript/backend files | `pnpm api:typecheck` |
| Both `apps/mobile/**` and `apps/api/**` | `pnpm typecheck` |
| Root docs / AGENTS / skills / registry only | Read back files; no app typecheck required unless behavior changed |
| Cross-workspace config or uncertain impact | `pnpm validate` |

- `pnpm typecheck` is the default cross-workspace validation command.
- `pnpm mobile:config` is required when Expo config may be affected.
- Prefer the smallest command set that still covers the files changed.
- If a change is documentation-only, verify file contents directly and avoid unnecessary app churn.

## Code Examples

```text
Changed: apps/mobile/src/**
Run: pnpm mobile:typecheck

Changed: apps/mobile/app.json
Run: pnpm mobile:typecheck && pnpm mobile:config

Changed: apps/api/src/** and apps/mobile/src/**
Run: pnpm typecheck
```

## Commands

```bash
pnpm mobile:typecheck
pnpm mobile:config
pnpm api:typecheck
pnpm typecheck
pnpm validate
```

## Resources

- **Documentation**: `README.md`, `AGENTS.md`
- **Workspace scripts**: `package.json`
