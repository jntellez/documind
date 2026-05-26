# Observability (Minimal Setup)

This project keeps observability intentionally lightweight and focused on essential signals:

- **Uptime monitoring**: poll API `GET /health`
- **Crash reporting (mobile)**: Sentry startup init behind `EXPO_PUBLIC_SENTRY_DSN`
- **Analytics**: event plan documented only (no SDK implementation yet)

## 1) API health endpoint for uptime monitors

Endpoint:

- `GET /health`

Current behavior:

- **200 OK** when API process and database are both reachable
- **503 Service Unavailable** when API is running but database check fails

Response examples:

```json
// 200
{
  "ok": true,
  "status": "healthy",
  "services": {
    "api": "up",
    "database": "up"
  }
}
```

```json
// 503
{
  "ok": false,
  "status": "degraded",
  "services": {
    "api": "up",
    "database": "down"
  },
  "error": "Database unavailable"
}
```

### UptimeRobot (free plan) setup

1. Deploy API publicly (Render URL or your production host).
2. In UptimeRobot, create a **HTTP(s)** monitor.
3. URL: `https://<your-api-host>/health`
4. Monitoring interval: **5 minutes** (free-plan common default).
5. Timeout: keep default unless your platform is slow on cold starts.
6. Keyword checks: optional; status-code check is enough for this API.
7. Alert contacts: add email/Discord/Slack as needed.

Recommended alert interpretation:

- **200** = API and DB healthy.
- **503** = API process alive, DB unavailable/degraded.
- **No response/timeout** = API host or network path issue.

### Quick verification commands

```bash
# Healthy case
curl -i https://<your-api-host>/health

# Local (while running pnpm api:dev)
curl -i http://localhost:3000/health
```

## 2) Mobile crash reporting (Sentry, minimal)

Implemented now (minimal, real Expo path):

- Dependency: `@sentry/react-native`
- Expo plugin enabled in `apps/mobile/app.json`: `@sentry/react-native/expo`
- Sentry initializes from app entry (`apps/mobile/index.ts`) via `initSentry()`
- Root component is wrapped using `Sentry.wrap(App)`
- `Sentry.init(...)` runs only when `EXPO_PUBLIC_SENTRY_DSN` is set

Configure local env:

```bash
# apps/mobile/.env
EXPO_PUBLIC_SENTRY_DSN=https://<publicKey>@o<org>.ingest.sentry.io/<projectId>
```

Optional build-time env (for cleaner release/source-map flows later):

```bash
SENTRY_ORG=<your-org>
SENTRY_PROJECT=<your-project>
```

Notes:

- Keep DSN public-side only (`EXPO_PUBLIC_*`) — never put auth tokens in Expo public env.
- This is intentionally minimal: no performance tracing, no replay/session instrumentation.
- If DSN is missing, Sentry remains disabled with no crash-reporting overhead.
- This setup captures runtime crashes, including early startup path coverage from the entry file.

Not implemented yet (deferred intentionally):

- Sentry release/version wiring for production builds
- Source map upload automation in EAS/CI
- Advanced native build-time tuning

These deferred pieces improve stack traces in production but add setup complexity. Runtime crash capture is prioritized first to keep the initial integration friction low.

## 3) Analytics (documented-only plan)

No analytics SDK is installed yet. This is intentional to keep complexity low.

Minimal event plan to implement later (if needed):

- `auth_login_success` — user signs in successfully
- `document_ingest_started` — upload/import begins
- `document_ingest_completed` — upload/import succeeds
- `document_chat_message_sent` — user sends a chat question

Event properties (minimal):

- `platform` (`ios` | `android` | `web`)
- `source` (`pdf` | `docx` | `url` | `pptx`)
- `duration_ms` (for ingest completed)

Tradeoff:

- Documenting first avoids over-instrumenting too early.
- If product needs grow, add one SDK later and wire only these events first.
