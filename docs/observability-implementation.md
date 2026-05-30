# Observability Implementation Guide

This document details the observability strategy and implementation across the `uitfood` monorepo. The project utilizes a combination of OpenTelemetry, Grafana Cloud (Faro/OTLP), and Sentry to provide comprehensive logging, distributed tracing, and metrics across the backend API, Web application, and Mobile client.

---

## 1. Architecture Overview

The observability stack is designed to provide end-to-end visibility:
- **Backend (API)**: Powered by OpenTelemetry Node SDK, exporting Traces, Metrics, and Logs via OTLP directly to Grafana Cloud (or a local collector).
- **Web Frontend**: Powered by Grafana Faro for Real User Monitoring (RUM), performance tracking, and frontend error reporting. Trace headers are propagated to the backend for full-stack correlation.
- **Mobile Client**: Powered by Sentry (`@sentry/react-native`) for native crash reporting, error tracking, and performance monitoring.

---

## 2. Backend (API) Observability

The API (built with NestJS) uses the OpenTelemetry SDK for unified observability. All configurations and core implementations reside in `apps/api/src/observability/`.

### 2.1 OpenTelemetry Initialization
Instrumentation is bootstrapped in `instrumentation.ts` before the NestJS application starts.
- **Auto-Instrumentation**: `@opentelemetry/auto-instrumentations-node` provides automatic tracing for HTTP, databases (pg, redis), and standard Node libraries.
- **HTTP Filtering**: Health check endpoints (e.g., `/health`) are explicitly ignored to prevent trace span noise.
- **Metrics**: `@opentelemetry/instrumentation-runtime-node` exports Node.js runtime metrics (event loop, memory).

### 2.2 Exporters & Exporter Configuration
Data is exported using OTLP over HTTP. Configuration heavily relies on environment variables:
- `OTEL_EXPORTER_OTLP_ENDPOINT` or `GRAFANA_CLOUD_OTLP_ENDPOINT`
- Authorization is seamlessly generated using `GRAFANA_CLOUD_OTLP_USERNAME_OR_INSTANCE_ID` and `GRAFANA_CLOUD_OTLP_TOKEN`.

If no exporter endpoint is provided, observability features gracefully remain disabled.

### 2.3 Structured JSON Logging
A custom `JsonLogger` (`json-logger.ts`) implements the NestJS `LoggerService`.
- **JSON Formatting**: Standard console logs are serialized to JSON with standard fields (`level`, `timestamp`, `service`, `message`, `stack`).
- **Context Injection**: Uses OpenTelemetry API (`trace.getActiveSpan()`) to automatically inject `traceId`, `spanId`, and custom `requestId` into the JSON payload.
- **OTLP Logs**: Logs are simultaneously emitted to OpenTelemetry via `@opentelemetry/api-logs` (`OTEL_LOGGER.emit`), ensuring logs and traces exist within the same Grafana Cloud ecosystem and can be correlated seamlessly.
- **Redaction**: Built-in redaction (`redactString`, `redactValue`) ensures sensitive data does not leak into logs.

---

## 3. Web Client Observability

The web dashboard (`apps/web`) leverages Grafana Faro for Real User Monitoring (RUM). The configuration lives in `apps/web/src/lib/observability.ts`.

### 3.1 Grafana Faro Initialization
The application initializes `faroClient` utilizing `@grafana/faro-react` and `@grafana/faro-web-tracing`:
- **Endpoint**: Target collector is defined via `VITE_GRAFANA_FARO_COLLECTOR_URL`.
- **App Context**: `appName`, `appVersion`, and `commitSha` are sent for deployment tracking.
- **Console Instrumentation**: Captures `console.error` logs and routes them to Faro while filtering out low-level noise (Trace, Debug).

### 3.2 Distributed Tracing & Error Handling
- **Header Propagation**: The `TracingInstrumentation` is configured to inject W3C trace headers into outgoing Axios/Fetch requests hitting the backend API (`/^\/api/` or `VITE_API_BASE_URL`).
- **React Router Integration**: Integrated with React Router v7 (`createReactRouterV7DataOptions`) to capture page loads and route changes as transactions.
- **API Error Capturing**: Helper functions (`addApiErrorBreadcrumb`, `captureApiError`) are provided to push sanitized `AxiosError` details and context (status code, URL, x-request-id) directly to Faro.

---

## 4. Mobile Client Observability

The mobile application (`apps/mobile` - built with Expo/React Native) uses Sentry for native and JS exception tracking. Configuration is found in `apps/mobile/src/lib/observability.ts`.

### 4.1 Sentry Initialization
Uses `@sentry/react-native` instantiated via `Sentry.init()`.
- **Environment Targeting**: Configured via Expo environment variables (`EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_APP_ENV`, etc.).
- **Tags**: Automatic tagging of `app_env`, `app_version`, and `commit_sha` to correlate crashes with specific builds.
- **PII Handling**: `sendDefaultPii` is disabled to ensure user privacy by default.

### 4.2 Error Capturing
Provides utility wrappers like `captureMobileException` which allows developers to append custom `Record<string, unknown>` context to the Sentry scope right before capturing an exception, helping surface context-specific states when an app crashes.

---

## 5. Deployment & CI/CD Integrations

- **GitHub Actions**: The `.github/workflows/` files (e.g., `cd-package-docker.yml`, `pipeline-web.yml`) are configured to securely inject Grafana Cloud and Faro credentials (`GRAFANA_FARO_APP_ID`, `GRAFANA_CLOUD_STACK_ID`, sourcemap APIs) during the build process.
- **Render Infra**: Environment configurations suggest Render or Docker deployments, where these environment variables are loaded via `.env` injection.

## 6. Best Practices & Guidelines for Developers

1. **Correlation**: Always ensure `x-request-id` headers are passed through service boundaries if manual instrumentation is needed. OpenTelemetry generally handles this automatically for HTTP.
2. **Log Redaction**: Do not log PII (Personally Identifiable Information), tokens, or passwords. Rely on the `JsonLogger` redaction logic, but remain vigilant.
3. **Frontend Errors**: For the Web app, use `captureApiError(err)` in try/catch blocks making critical API calls. For Mobile, use `captureMobileException(err, context)`.
4. **Environment Context**: Always ensure `.env` values for `APP_ENV` and `APP_VERSION` are accurate, as they are crucial for filtering logs and traces in Grafana or Sentry.
