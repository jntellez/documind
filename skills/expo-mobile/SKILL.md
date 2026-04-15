---
name: expo-mobile
description: >
  Project guidance for changes inside apps/mobile using Expo, React Native, and TypeScript.
  Trigger: When the task touches apps/mobile, mobile UI flows, Expo config, or React Native code.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Any change under `apps/mobile`
- Expo app configuration updates
- React Native screens, hooks, navigation, or TypeScript changes

## Critical Patterns

- Keep mobile edits inside `apps/mobile` unless the task explicitly requires shared docs or root tooling.
- Match existing Expo + React Native + TypeScript patterns already used in the mobile workspace.
- Use root workspace commands for validation when possible.
- Validate with `pnpm mobile:typecheck` after code changes in `apps/mobile`.
- Run `pnpm mobile:config` when editing Expo config files such as `app.json`.
- Expo tunnel mode is optional and not required for normal code changes.
- Do not commit secrets or local device-specific configuration.

## Code Examples

```ts
// Good: keep imports and types aligned with existing mobile TS patterns.
type ScreenProps = {
  title: string;
};
```

## Commands

```bash
pnpm mobile:start
pnpm mobile:typecheck
pnpm mobile:config
pnpm mobile:android
pnpm mobile:ios
pnpm mobile:web
```

## Resources

- **Documentation**: `README.md`
- **Workspace**: `apps/mobile/package.json`
