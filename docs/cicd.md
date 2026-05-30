# CI/CD in UITFood

## Overview

UITFood uses **GitHub Actions** for all CI/CD automation. The project is a **pnpm monorepo** orchestrated by **Turborepo**, containing four apps:

| App | Type | Packaging | Deployment |
|-----|------|-----------|------------|
| `api` | NestJS backend | Docker → GHCR | Render (web service) |
| `web` | Vite/React SPA | Docker → GHCR (nginx) | Render (web service) |
| `admin` | Vite/React SPA | Docker → GHCR (nginx) | Render (web service) |
| `mobile` | Expo/React Native | EAS local Android build (APK) | GitHub Actions artifact |

---

## Workflow Inventory

All workflows live under `.github/workflows/`. They follow a naming convention:

- `pipeline-<app>.yml` — full CI+CD pipeline for an app, triggered on `push` to `master`
- `ci-*.yml` — reusable CI (validation) workflow
- `cd-*.yml` — reusable CD (packaging/deployment) workflow
- `pr-*.yml` — PR gate workflow

| File | Purpose | Trigger |
|------|---------|---------|
| `pr-master-validate.yml` | PR gate — validates all affected apps before merge | `pull_request` → `master` |
| `pipeline-api.yml` | API full pipeline (validate → publish → deploy) | `push` to `master`, `apps/api/**` |
| `pipeline-web.yml` | Web full pipeline (validate → publish → deploy) | `push` to `master`, `apps/web/**` |
| `pipeline-admin.yml` | Admin full pipeline (validate → publish → deploy) | `push` to `master`, `apps/admin/**` |
| `pipeline-mobile.yml` | Mobile full pipeline (validate → publish) | `push` to `master`, `apps/mobile/**` |
| `ci-validate.yml` | Reusable: lint, typecheck, audit, test, build, E2E | `workflow_call` |
| `cd-package-docker.yml` | Reusable: build & push Docker image to GHCR | `workflow_call` |
| `cd-package-mobile.yml` | Reusable: EAS local Android build, upload APK artifact | `workflow_call` |
| `cd-render-image.yml` | Reusable: trigger Render deploy hook with image tag | `workflow_call` |
| `cd-render-iac.yml` | Reusable: Terraform apply on Render IaC | `workflow_call` |

A custom composite action at `.github/actions/setup-environment/action.yml` standardises environment bootstrap (pnpm 11.1.2, Node 22, `pnpm install --frozen-lockfile`) across all workflows.

---

## CI — Pull Request Gate

**File:** `pr-master-validate.yml`

Triggered on any PR opened/updated/reopened against `master`. It calls the reusable `ci-validate.yml` (see below). If validation fails, a GitHub bot automatically posts a comment on the PR linking to the failed run.

Concurrency is grouped per PR number (`cancel-in-progress: true`) so only the latest push to a PR branch runs.

---

## CI — Reusable Validate Workflow

**File:** `ci-validate.yml`

This workflow is the shared validation core used by both the PR gate and the per-app pipelines. It runs on `ubuntu-latest` and spins up two service containers:

- **PostgreSQL 18** — on port 5432, health-checked with `pg_isready`
- **Redis 7 (Alpine)** — on port 6379, health-checked with `redis-cli ping`

### Steps

1. **Checkout** — full history (`fetch-depth: 0`) for Turbo affected range calculation
2. **Configure Turbo Affected Range** — sets `TURBO_SCM_BASE` and `TURBO_SCM_HEAD` so Turbo only runs tasks on packages changed since the PR base (or `HEAD^` on direct pushes)
3. **Setup Environment** — runs the composite action (pnpm + Node + install)
4. **Turbo Cache** — restores/saves `.turbo` build cache keyed on `${{ github.sha }}`
5. **Check (Lint & Typecheck)** — `pnpm turbo run lint typecheck --affected`
6. **Security Scan (Audit)** — `pnpm audit --audit-level high`
7. **Unit Test** — `pnpm turbo run test --affected` (with real Postgres and Redis URLs in env)
8. **Build** — `pnpm turbo run build --affected`
9. **Setup Database (Migrate)** — `pnpm --filter=api run db:push` to apply schema to the test database
10. **E2E Test** — `pnpm turbo run test:e2e --filter=api` against the live test services

Turbo remote cache is enabled via `TURBO_TOKEN` / `TURBO_TEAM` secrets, allowing task results to be shared across runs and CI machines.

---

## CD — Per-App Pipelines

Each app pipeline follows a three-job chain:

```
validate ──► publish ──► deploy-render
```

Pipelines are path-filtered so they only run when files in their respective `apps/<app>/**` directory change. All pipelines support `workflow_dispatch` for manual runs. Concurrency is grouped per pipeline + branch (`cancel-in-progress: true`).

### API Pipeline (`pipeline-api.yml`)

- **validate** — inline (not the reusable workflow), runs its own Postgres + Redis services, runs lint → typecheck → audit → unit test → build → db:push → E2E
- **publish** — calls `cd-package-docker.yml` to build and push the `api` Docker image to GHCR
- **deploy-render** — calls `cd-render-image.yml` to trigger the Render deploy hook

### Web Pipeline (`pipeline-web.yml`)

- **validate** — no service containers needed; runs lint → typecheck → audit → unit test → build (with Vite env vars injected: `VITE_API_BASE_URL`, `VITE_APP_ENV`, `VITE_APP_VERSION`, `VITE_COMMIT_SHA`, Grafana Faro, PostHog)
- **publish** — calls `cd-package-docker.yml`, passing all Vite build args and Grafana Faro source map config
- **deploy-render** — calls `cd-render-image.yml`

### Admin Pipeline (`pipeline-admin.yml`)

- **validate** — lint → typecheck → audit → unit test → build (with `VITE_API_BASE_URL`, `VITE_APP_ENV`, `VITE_APP_VERSION`, `VITE_COMMIT_SHA`)
- **publish** — calls `cd-package-docker.yml`
- **deploy-render** — calls `cd-render-image.yml`

### Mobile Pipeline (`pipeline-mobile.yml`)

- **validate** — lint → typecheck → audit → unit test → build (with Expo public env vars and Sentry config). After build, conditionally uploads source maps to Sentry using `sentry-cli` (skipped if Sentry secrets are absent)
- **publish** — calls `cd-package-mobile.yml` (no deploy step; artifact is uploaded instead)

---

## Docker Packaging (`cd-package-docker.yml`)

Reusable workflow called by the API, Web, and Admin pipelines.

**Steps:**
1. Checkout
2. Log in to **GHCR** (`ghcr.io`) using `GITHUB_TOKEN`
3. Set up **Docker Buildx**
4. Resolve image name — defaults to `ghcr.io/<owner>/<repo>-<app>` (lowercase)
5. Extract metadata — tags the image with both `refs/heads/master` (branch tag) and `sha-<short-sha>`
6. **Build & Push** — uses `docker/build-push-action`
   - Non-web apps (`api`): straightforward multi-stage build
   - Web/admin apps: injects all `VITE_*` environment variables and Grafana Faro source map secrets as Docker build args; source map API key is passed as a BuildKit secret (not baked into image layers)
   - GitHub Actions cache (`type=gha`) is used per-app scope to speed up layer reuse

### Dockerfiles

All Dockerfiles use a **multi-stage build** pattern leveraging `turbo prune --docker` to produce a minimal isolated subworkspace:

| Stage | Purpose |
|-------|---------|
| `builder` | Runs `turbo prune --scope=<app> --docker` to trim the monorepo to only relevant packages |
| `installer` | Copies pruned lockfile + `package.json`s, runs `pnpm install --frozen-lockfile` |
| `production-deps` (API only) | Installs production-only deps for the slim runtime image |
| `runner` | Final image — copies only `dist/` + prod `node_modules` (API), or serves static files with **nginx** (Web/Admin) |

- **API** runs as a non-root `nestjs` user in the `nodejs` group, exposes port 3000
- **Web** and **Admin** serve the built `dist/` with **nginx** on port 80 using a custom `nginx.conf`

---

## Mobile Packaging (`cd-package-mobile.yml`)

Reusable workflow called by the Mobile pipeline.

**Steps:**
1. Checkout
2. Setup Environment (pnpm + Node)
3. Setup **Expo** via `expo/expo-github-action` (EAS CLI 18.13.0) with `EXPO_TOKEN`
4. Setup **Java 17** (Temurin) — required for Android builds
5. **EAS local Android build** — `eas build --platform android --profile development --local --non-interactive --output build.apk` (runs entirely on the GitHub runner, no EAS cloud build minutes consumed)
6. **Upload artifact** — `build.apk` is uploaded as `mobile-production-build` artifact in the workflow run

---

## Deployment to Render (`cd-render-image.yml`)

Reusable workflow that triggers a **Render deploy hook** with a specific Docker image reference.

**Logic:**
1. Resolves the image URL (defaults to `ghcr.io/<repo>-<app>`) and image tag (defaults to `sha-<short-sha>`)
2. Calls the Render deploy hook URL via `curl --get --data-urlencode "imgURL=<image-ref>"` 
3. Writes a summary to the GitHub Actions step summary

Each app has its own deploy hook secret: `RENDER_API_DEPLOY_HOOK`, `RENDER_WEB_DEPLOY_HOOK`, `RENDER_ADMIN_DEPLOY_HOOK`.

---

## Infrastructure as Code (`cd-render-iac.yml`)

Reusable Terraform workflow for managing Render infrastructure declaratively.

**Location:** `infra/render/` — manages:
- `UITFood API` web service
- `UITFood Web` web service  
- `UITFood Postgres` managed database

**Remote State:** Uses **HCP Terraform** (`cloud {}` block) with organisation `UITFood` and workspace `uitfood-render-production` — no local state file.

**Steps:**
1. Checkout
2. Setup Terraform (version 1.15.4) with HCP Terraform token (`TF_API_TOKEN`)
3. `terraform fmt -check -recursive`
4. `terraform init`
5. **Resolve image tags** — determines `TF_VAR_api_image_tag` and `TF_VAR_web_image_tag` from inputs (explicit tag, `sha-<short-sha>`, or read from current Terraform state via `terraform state pull` + Python)
6. `terraform validate`
7. `terraform apply -auto-approve` (only if `inputs.apply == true`)

This workflow is designed to be called with `apply: true` for infrastructure changes on `master`, but can also run in plan-only mode for PRs.

---

## Caching Strategy

| Cache | Key | Scope |
|-------|-----|-------|
| Turbo task cache (local) | `${{ runner.os }}-turbo-${{ github.sha }}` | Per-commit, falls back to OS-level |
| Turbo remote cache | Turbo Cloud (via `TURBO_TOKEN`/`TURBO_TEAM`) | Cross-machine, cross-run |
| pnpm store | Managed by `actions/setup-node` with `cache: 'pnpm'` | Keyed on lockfile hash |
| Docker layers | GitHub Actions cache (`type=gha`), per-app scope | Speeds up image rebuilds |

---

## Secrets & Variables Reference

### Secrets (sensitive values)

| Secret | Used by |
|--------|---------|
| `TURBO_TOKEN` | Turbo remote cache authentication |
| `TURBO_TEAM` | Turbo remote cache team identifier |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` | API tests (auth) |
| `VNPAY_TMN_CODE` / `VNPAY_HASH_SECRET` / `VNPAY_URL` / `VNPAY_RETURN_URL` | API tests (payment) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | API tests (media) |
| `RENDER_API_DEPLOY_HOOK` | API Render deployment |
| `RENDER_WEB_DEPLOY_HOOK` | Web Render deployment |
| `RENDER_ADMIN_DEPLOY_HOOK` | Admin Render deployment |
| `RENDER_API_KEY` | Terraform Render provider |
| `RENDER_OWNER_ID` | Terraform Render provider |
| `TF_API_TOKEN` | HCP Terraform remote state |
| `EXPO_TOKEN` | EAS mobile builds |
| `SENTRY_AUTH_TOKEN` | Sentry source map uploads |
| `POSTHOG_WEB_KEY` | Web analytics (Docker build arg) |
| `GRAFANA_FARO_SOURCEMAP_API_KEY` | Grafana Faro source map upload (BuildKit secret) |

### Repository Variables (non-sensitive)

| Variable | Used by |
|----------|---------|
| `VITE_API_BASE_URL` | Web/Admin build |
| `APP_VERSION` | All apps |
| `VITE_GRAFANA_FARO_COLLECTOR_URL` / `VITE_GRAFANA_FARO_APP_NAME` | Web build |
| `GRAFANA_FARO_SOURCEMAP_ENDPOINT` / `GRAFANA_FARO_APP_ID` / `GRAFANA_CLOUD_STACK_ID` | Web Docker build |
| `POSTHOG_WEB_HOST` | Web build |
| `EXPO_PUBLIC_API_URL` | Mobile build |
| `EXPO_PUBLIC_SENTRY_DSN` / `SENTRY_ORG` / `SENTRY_MOBILE_PROJECT` | Mobile Sentry |
| `EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | Mobile Sentry sampling |
| `TF_CLOUD_ORGANIZATION` / `TF_WORKSPACE` | Terraform IaC |

---

## End-to-End Flow (Example: API Change)

```
Developer pushes to feature branch
        │
        ▼
PR opened → pr-master-validate.yml
        │  - Runs ci-validate.yml (affected packages only)
        │  - If fails: bot comments on PR with run link
        │
PR merged to master
        │
        ▼
pipeline-api.yml triggered (apps/api/** changed)
        │
        ├─ [validate] lint → typecheck → audit → unit test → build → db:push → E2E
        │
        ├─ [publish]  cd-package-docker.yml
        │             → docker build (multi-stage, turbo prune)
        │             → push ghcr.io/<org>/<repo>-api:sha-<shortsha>
        │             → push ghcr.io/<org>/<repo>-api:master
        │
        └─ [deploy-render]  cd-render-image.yml
                            → curl Render deploy hook with imgURL=ghcr.io/...-api:sha-<shortsha>
                            → Render pulls new image and restarts service
```
