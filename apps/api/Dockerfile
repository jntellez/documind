FROM node:20-alpine AS deps

WORKDIR /workspace

RUN corepack enable

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json

RUN pnpm install --frozen-lockfile --filter @documind/api...

FROM oven/bun:1-alpine

WORKDIR /workspace

COPY --from=deps /workspace/package.json ./
COPY --from=deps /workspace/pnpm-lock.yaml ./
COPY --from=deps /workspace/pnpm-workspace.yaml ./
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/apps/api/package.json apps/api/package.json
COPY --from=deps /workspace/packages/types/package.json packages/types/package.json

COPY apps/api apps/api
COPY packages/types packages/types

WORKDIR /workspace/apps/api

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
