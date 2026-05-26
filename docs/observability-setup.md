# Observability Setup

This repository uses:

- OpenTelemetry in `apps/api` for backend traces, metrics, and trace-correlated logs.
- Grafana Cloud as the backend for API observability through OTLP.
- Sentry in `apps/web` and `apps/mobile` for client errors, crashes, performance, releases, and source maps.
- PostHog in `apps/web` and `apps/mobile` for product analytics and feature flags.

Backend telemetry is vendor-neutral. The API exports OTLP either directly to Grafana Cloud or to the local OpenTelemetry Collector in `infra/otel-collector`.

For operational instructions, see `OBSERVABILITY.md` at the repository root.
