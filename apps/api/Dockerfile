FROM oven/bun:1-alpine

WORKDIR /workspace

COPY package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json

RUN bun install --filter @documind/api

COPY apps/api apps/api
COPY packages/types packages/types

WORKDIR /workspace/apps/api

EXPOSE 3000

CMD ["bun", "run", "--hot", "src/index.ts"]
