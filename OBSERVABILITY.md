# Observability

## Runtime Flow

- API: OpenTelemetry auto-instrumentation and custom spans export OTLP traces and metrics to `OTEL_EXPORTER_OTLP_ENDPOINT`.
- Collector: `docker compose up -d otel-collector` receives OTLP locally and logs summaries; add `docker-compose.otel-grafana.yml` to forward to Grafana Cloud.
- Web: Sentry captures React errors/performance; PostHog captures page views and product events.
- Mobile: Sentry React Native captures JS/native errors; PostHog React Native captures lifecycle, screen views, and key events.

## Required Production Secrets

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS` for direct Grafana export, or `GRAFANA_CLOUD_OTLP_ENDPOINT`, `GRAFANA_CLOUD_OTLP_USERNAME_OR_INSTANCE_ID`, and `GRAFANA_CLOUD_OTLP_TOKEN` for the collector
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_WEB_PROJECT`, `SENTRY_MOBILE_PROJECT`
- `VITE_SENTRY_DSN`, `EXPO_PUBLIC_SENTRY_DSN`
- `VITE_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`

Do not commit real tokens. Store them in CI/CD or hosting-provider secret storage.

## Metadata

Set these on every deployment:

```env
APP_ENV=production
APP_VERSION=1.0.0
COMMIT_SHA=<git-sha>
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_COMMIT_SHA=<git-sha>
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_COMMIT_SHA=<git-sha>
```

## Local Checks

```powershell
docker compose up -d otel-collector
$env:OTEL_EXPORTER_OTLP_ENDPOINT='http://localhost:4318'
pnpm --filter api dev
```

Then call `GET /api/ready` or any API endpoint and watch:

```powershell
docker compose logs -f otel-collector
```

## Privacy Defaults

- Backend logs redact authorization, cookies, tokens, secrets, passwords, API keys, payment signatures, and IP-like fields.
- Sentry has `sendDefaultPii` disabled.
- PostHog session replay is disabled by default on web and mobile.
- Analytics helpers filter common sensitive property names before capture.
