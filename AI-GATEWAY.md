# AI Gateway

A local-first multi-provider AI gateway that exposes one internal API and routes requests across free-tier LLM providers.

## Goal

Provide a single, reusable AI endpoint for personal projects so client applications do not need to integrate Groq, Gemini, or Cerebras directly.

## What this project is

AI Gateway is a small TypeScript service built with Hono that:

- accepts a unified AI request shape,
- selects an available provider,
- falls back only for recoverable provider failures,
- exposes lightweight diagnostics for local development.

It is designed for local use first and to stay simple in v1.

## Current v1 scope

The current v1 includes:

- one main API endpoint: `POST /v1/ai/respond`
- provider adapters for Groq, Gemini, and Cerebras
- health-aware routing with basic fallback behavior
- in-memory provider state and metrics
- request validation
- structured logging
- diagnostic endpoints: `GET /v1/health`, `GET /v1/providers`, `GET /v1/metrics`

## Intentionally out of scope for v1

The following are intentionally excluded from v1:

- streaming responses
- databases, Redis, or other required persistence
- authentication and authorization
- caching
- billing or usage accounting
- dashboards or UI
- deployment infrastructure or Docker requirements
- advanced distributed systems concerns

## Constraints
- zero-cost v1
- no mandatory database in v1
- no streaming in v1
- local-first development

## Initial providers
- Groq
- Gemini
- Cerebras

## Stack
- TypeScript
- Hono
- Zod
- Pino
- Vitest

## Setup

### Requirements

- Node.js `>=24`
- pnpm `>=10`

### Install dependencies

```bash
pnpm install
```

### Environment variables

Copy the example file and configure any providers you want to enable:

```bash
cp .env.example .env
```

Available variables:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | HTTP server port |
| `NODE_ENV` | No | `development` | Runtime environment |
| `LOG_LEVEL` | No | `info` | Pino log level |
| `DEFAULT_TIMEOUT_MS` | No | `15000` | Per-provider request timeout |
| `GROQ_API_KEY` | No | empty | Enables Groq when set |
| `GEMINI_API_KEY` | No | empty | Enables Gemini when set |
| `CEREBRAS_API_KEY` | No | empty | Enables Cerebras when set |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Default Groq model |
| `GEMINI_MODEL` | No | `gemini-2.0-flash` | Default Gemini model |
| `CEREBRAS_MODEL` | No | `llama3.1-8b` | Default Cerebras model |

Environment source behavior:

- `pnpm dev` and `pnpm start` load `.env` and `.env.local`
- Cloudflare Workers reads bindings and secrets provided by Wrangler or the Cloudflare dashboard
- the same variable names are used in both runtimes

Provider configuration behavior:

- the server still starts if some provider API keys are missing,
- providers without API keys are marked disabled,
- the gateway remains usable as long as at least one provider is configured correctly.

## Run locally

Start the development server:

```bash
pnpm dev
```

This loads `.env` and `.env.local` automatically.

Build and run the compiled server:

```bash
pnpm build
pnpm start
```

By default the server listens on `http://localhost:3000`.

## Run with Cloudflare Workers locally

Install dependencies, then create a local Workers env file:

```bash
cp .env.example .dev.vars
```

Set any provider API keys you want to enable inside `.dev.vars`, then run:

```bash
pnpm dev:worker
```

Wrangler serves the Worker locally and injects the bindings from `.dev.vars`.

## Deploy to Cloudflare Workers

1. Authenticate with Cloudflare:

```bash
pnpm exec wrangler login
```

2. Add required provider secrets for any providers you want enabled:

```bash
pnpm exec wrangler secret put GROQ_API_KEY
pnpm exec wrangler secret put GEMINI_API_KEY
pnpm exec wrangler secret put CEREBRAS_API_KEY
```

3. Optionally set non-secret vars in the Cloudflare dashboard or with Wrangler for:

- `NODE_ENV`
- `LOG_LEVEL`
- `DEFAULT_TIMEOUT_MS`
- `GROQ_MODEL`
- `GEMINI_MODEL`
- `CEREBRAS_MODEL`

4. Deploy:

```bash
pnpm deploy:worker
```

### Required env vars and secrets

- At least one provider API key must be configured for the gateway to serve AI responses.
- `GROQ_API_KEY`, `GEMINI_API_KEY`, and `CEREBRAS_API_KEY` should be stored as Cloudflare Worker secrets when used in Workers.
- Non-secret settings can rely on defaults unless you need to override them.

### Cloudflare Workers v1 limitations

- provider state and metrics remain in memory, so they reset on Worker instance restarts
- local Node mode and Workers mode share the same request/response contract, but logs are emitted through `console` in Workers instead of Pino
- this setup is intended for simple v1 deployment readiness, not advanced production features such as durable state, streaming, or auth

## Test and validation

```bash
pnpm test
pnpm typecheck
pnpm build
```

## Scripts

- `pnpm dev` - run the local development server with watch mode
- `pnpm dev:worker` - run the Cloudflare Worker locally with Wrangler
- `pnpm build` - compile TypeScript into `dist/`
- `pnpm start` - run the compiled server from `dist/index.js`
- `pnpm deploy:worker` - deploy the Worker with Wrangler
- `pnpm test` - run the Vitest suite
- `pnpm typecheck` - run TypeScript type checking without emitting files
- `pnpm lint` - same as `typecheck` in the current v1 setup

## API overview

### Main endpoint

- `POST /v1/ai/respond`

### Diagnostic endpoints

- `GET /v1/health` - quick readiness-style snapshot of overall gateway/provider availability
- `GET /v1/providers` - current in-memory provider state for each configured provider
- `GET /v1/metrics` - request totals, provider attempt totals, and the provider state snapshot

## Request body shape

`POST /v1/ai/respond` accepts this JSON shape:

```json
{
  "task": "chat",
  "messages": [
    {
      "role": "user",
      "content": "Explain what this gateway does in one sentence."
    }
  ],
  "temperature": 0.2,
  "maxTokens": 256,
  "responseFormat": "text",
  "priority": "normal",
  "metadata": {
    "source": "readme-example"
  }
}
```

Field notes:

- `task` must be one of `chat`, `json`, `summary`, or `classification`
- `messages` must contain at least one message
- each message requires `role` (`system`, `user`, `assistant`) and non-empty `content`
- `temperature` is optional and must be between `0` and `2`
- `maxTokens` is optional and must be a positive integer up to `32768`
- `responseFormat` is optional and must be `text` or `json`
- `priority` is optional and must be `low`, `normal`, or `high`
- `metadata` is optional and accepts a JSON object

## Example request

```bash
curl -X POST http://localhost:3000/v1/ai/respond \
  -H "content-type: application/json" \
  -d '{
    "task": "chat",
    "messages": [
      {
        "role": "user",
        "content": "Say hello from AI Gateway."
      }
    ],
    "temperature": 0.2,
    "maxTokens": 64
  }'
```

## Success response example

```json
{
  "requestId": "req_01hxyzexample",
  "data": {
    "provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "text": "Hello from AI Gateway.",
    "latencyMs": 482,
    "fallbackUsed": false,
    "usage": {
      "inputTokens": 12,
      "outputTokens": 8,
      "totalTokens": 20
    }
  }
}
```

## Error response examples

Validation error example:

```json
{
  "requestId": "req_01hxyzexample",
  "error": {
    "type": "BAD_REQUEST",
    "message": "Invalid AI request payload",
    "details": [
      {
        "path": "messages.0.content",
        "message": "String must contain at least 1 character(s)"
      }
    ]
  }
}
```

Malformed JSON example:

```json
{
  "requestId": "req_01hxyzexample",
  "error": {
    "type": "BAD_REQUEST",
    "message": "Malformed JSON request body"
  }
}
```

Provider availability example:

```json
{
  "requestId": "req_01hxyzexample",
  "error": {
    "type": "UNAVAILABLE",
    "message": "No AI providers are currently available"
  }
}
```

## Practical response and error taxonomy

Successful `POST /v1/ai/respond` responses always return:

- `requestId`
- `data.provider`
- `data.model`
- `data.text`
- `data.latencyMs`
- `data.fallbackUsed`
- optional `data.usage`

Common error types:

- `BAD_REQUEST` - invalid request body or malformed JSON
- `AUTH` - provider credentials are invalid
- `RATE_LIMIT` - the selected provider rejected the request for quota or rate reasons
- `TIMEOUT` - provider request exceeded timeout
- `UNAVAILABLE` - no provider is currently eligible or all recoverable attempts failed
- `SERVER_ERROR` - unexpected internal or provider-side server failure
- `UNKNOWN` - provider returned an unmapped error

Practical fallback behavior:

- recoverable failures may trigger fallback to another provider,
- non-recoverable failures such as `BAD_REQUEST` or `AUTH` do not fall back,
- if all recoverable attempts fail, the request returns `503 UNAVAILABLE`.

## Diagnostic endpoint examples

### `GET /v1/health`

```json
{
  "status": "ok",
  "providers": {
    "total": 3,
    "available": 2
  }
}
```

- `status: "ok"` means at least one provider is currently available
- `status: "degraded"` means no provider is currently available

### `GET /v1/providers`

```json
{
  "providers": [
    {
      "name": "groq",
      "enabled": true,
      "status": "healthy",
      "baseWeight": 4,
      "model": "llama-3.3-70b-versatile",
      "consecutiveFailures": 0,
      "consecutiveSuccesses": 3,
      "avgLatencyMs": 420,
      "errorRate": 0,
      "localRequestsLastMinute": 3,
      "localEstimatedTokensLastMinute": 180,
      "requestWindowStartedAt": 1760000000000,
      "totalAttempts": 3,
      "totalFailures": 0,
      "totalSuccesses": 3
    },
    {
      "name": "gemini",
      "enabled": false,
      "status": "disabled",
      "baseWeight": 3,
      "model": "gemini-2.0-flash",
      "disabledReason": "Missing GEMINI_API_KEY",
      "consecutiveFailures": 0,
      "consecutiveSuccesses": 0,
      "avgLatencyMs": 0,
      "errorRate": 0,
      "localRequestsLastMinute": 0,
      "localEstimatedTokensLastMinute": 0,
      "requestWindowStartedAt": 1760000000000,
      "totalAttempts": 0,
      "totalFailures": 0,
      "totalSuccesses": 0
    }
  ]
}
```

### `GET /v1/metrics`

```json
{
  "metrics": {
    "startedAt": "2026-04-11T00:00:00.000Z",
    "requests": {
      "total": 4,
      "successes": 3,
      "failures": 1,
      "fallbackSuccesses": 1
    },
    "providerAttempts": {
      "total": 5,
      "successes": 3,
      "failures": 2,
      "recoverableFailures": 1,
      "nonRecoverableFailures": 1
    },
    "providers": {
      "groq": {
        "attempts": 3,
        "successes": 2,
        "failures": 1,
        "recoverableFailures": 1,
        "nonRecoverableFailures": 0,
        "lastErrorType": "RATE_LIMIT"
      }
    }
  },
  "providers": []
}
```

`GET /v1/metrics` is mainly intended for local debugging and inspection, not as a stable analytics API.