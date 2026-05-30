# Project Structure, Management, and Version Control

This document explains how the UITFood repository is organized, how the project is managed locally and in deployment, and how version control is used to keep changes reviewable and reproducible.

## Repository overview

UITFood is a TypeScript monorepo managed with `pnpm` workspaces and Turborepo. The repository contains separate applications for the backend API, customer web app, admin web app, and mobile app, plus supporting documentation and infrastructure code.

```text
UITFood/
├─ apps/
│  ├─ api/       NestJS backend API
│  ├─ web/       Customer-facing React/Vite web app
│  ├─ admin/     Admin React/Vite web app
│  └─ mobile/    Expo React Native mobile app
├─ docs/         Project documentation
├─ infra/        Infrastructure-as-code resources
├─ .github/      GitHub Actions workflows and reusable actions
├─ docker-compose.yml
├─ package.json
├─ pnpm-workspace.yaml
└─ turbo.json
```

The root workspace is intentionally private and is used as the orchestration point for development, formatting, linting, building, testing, and CI/CD.

## Workspace and package management

The repository uses `pnpm` as its package manager. Workspace membership is defined in `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

At the time of writing, the active workspace packages are under `apps/*`. The `packages/*` workspace pattern is reserved for future shared libraries.

The root `package.json` provides cross-project commands:

| Command             | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `pnpm dev`          | Start Turborepo development tasks across apps.      |
| `pnpm build`        | Build all workspace applications through Turborepo. |
| `pnpm lint`         | Run linting across workspaces.                      |
| `pnpm test`         | Run workspace tests through Turborepo.              |
| `pnpm format`       | Format supported files with Prettier.               |
| `pnpm docker:up`    | Start local Docker Compose services.                |
| `pnpm docker:down`  | Stop local Docker Compose services.                 |
| `pnpm render:apply` | Apply Render infrastructure through Terraform.      |

Turborepo configuration in `turbo.json` defines the main task graph:

- `build` depends on upstream workspace builds and emits `dist/**`, `.next/**`, and `build/**`.
- `lint`, `test`, and `dev` are cache-aware workspace tasks.
- `dev` is marked persistent and is not cached.
- `deploy` depends on workspace builds.

Code formatting is centralized with Prettier. The repository formats TypeScript, JavaScript, JSON, Markdown, YAML, and CSS files, while generated and dependency directories such as `node_modules`, `.turbo`, `dist`, `build`, and coverage output are ignored.

## Application structure

### Backend API: `apps/api`

`apps/api` is a NestJS application. It provides the backend service layer, database access, authentication, file uploads, and business modules.

Key files and directories:

```text
apps/api/
├─ src/
│  ├─ main.ts             Application bootstrap
│  ├─ app.module.ts       Root NestJS module
│  ├─ config/             Runtime configuration
│  ├─ drizzle/            Database schema, migrations, seed data, and helpers
│  ├─ module/             Feature modules
│  └─ shared/             Shared backend utilities
├─ Dockerfile             Production image definition
├─ drizzle.config.ts      Drizzle ORM configuration
└─ package.json
```

The API uses:

- NestJS for the HTTP API and dependency injection.
- Drizzle ORM with PostgreSQL.
- Redis and BullMQ for queue-backed work.
- JWT and Passport for authentication.
- Swagger/OpenAPI generation through `@nestjs/swagger`.
- Sharp and Multer for image/file processing.

The root API module wires the main feature modules together. Current feature areas include authentication, addresses, branches, carts, coupons, delivery, favourites, feedback, food categories, food items, invoices, notifications, orders, payments, permissions, roles, search, shipping, statistics, uploads, and users.

The API Dockerfile uses a multi-stage build:

1. Install dependencies with `pnpm`.
2. Build the API workspace with Turborepo.
3. Run the production image with only production dependencies and compiled output.

### Customer web app: `apps/web`

`apps/web` is the customer-facing frontend built with React, Vite, and TypeScript.

Key files and directories:

```text
apps/web/
├─ src/
│  ├─ main.tsx            React entry point
│  ├─ app/                Application routing and app-level providers
│  ├─ components/         Reusable UI components
│  ├─ features/           Domain-oriented frontend features
│  ├─ hooks/              Shared React hooks
│  ├─ lib/                API clients and shared utilities
│  └─ pages/              Route-level pages
├─ Dockerfile
├─ index.html
├─ vite.config.ts
└─ package.json
```

The web app uses:

- React 19.
- Vite for development and production builds.
- React Router for routing.
- TanStack Query for server-state management.
- Tailwind CSS and project UI components for styling.
- Axios for API communication.

The web Dockerfile builds the static Vite output and serves it with Nginx.

### Admin app: `apps/admin`

`apps/admin` is the internal administration frontend. It is also built with React, Vite, and TypeScript, but its feature set is focused on operational and business management.

Key files and directories:

```text
apps/admin/
├─ src/
│  ├─ main.tsx
│  ├─ app/                Admin routing and app shell
│  ├─ components/         Admin UI components
│  ├─ features/           Admin feature modules
│  ├─ hooks/
│  ├─ lib/
│  └─ pages/
├─ Dockerfile
├─ index.html
├─ vite.config.ts
└─ package.json
```

The admin app uses the same general frontend stack as the customer web app: React, Vite, React Router, TanStack Query, Tailwind CSS, Axios, and shared UI patterns.

The admin Dockerfile also builds static assets and serves them through Nginx.

### Mobile app: `apps/mobile`

`apps/mobile` is an Expo React Native application.

Key files and directories:

```text
apps/mobile/
├─ src/
│  ├─ app/                Expo Router routes
│  ├─ components/         Mobile UI components
│  ├─ features/           Mobile feature modules
│  ├─ hooks/
│  ├─ lib/
│  ├─ providers/
│  ├─ services/
│  └─ types/
├─ assets/                Mobile assets and icons
├─ app.json               Expo application configuration
├─ eas.json               EAS build profiles
├─ expo-env.d.ts
└─ package.json
```

The mobile app uses:

- Expo and Expo Router.
- React Native 0.81.
- NativeWind and Tailwind CSS for styling.
- TanStack Query for server-state management.
- AsyncStorage for persisted local state.
- Expo Notifications and Expo Location.
- EAS Build profiles for development, preview, and production builds.

The root `eas.json` defines Android-oriented EAS profiles:

- `development`: development client build.
- `preview`: internal distribution APK.
- `production`: production APK.

## Infrastructure and runtime management

### Local services

`docker-compose.yml` defines local infrastructure services used during development:

- PostgreSQL database on host port `5433`.
- Redis on host port `6379`.
- MinIO object storage on ports `9000` and `9001`.

The compose stack creates named volumes for durable local data:

- `postgres-data`
- `redis-data`
- `minio-data`

The root scripts `pnpm docker:up` and `pnpm docker:down` manage this local stack.

### Environment configuration

The repository includes `.env.example` as the template for required environment variables. Developers should copy it to `.env` or an app-specific environment file and fill in local values.

Environment configuration covers:

- API runtime settings.
- PostgreSQL connection details.
- JWT secrets and expiration.
- Redis connection details.
- MinIO/S3-compatible object storage.
- Frontend API base URLs.
- Admin and customer web URLs.
- VNPay payment integration settings.
- Mobile public API URL.

Actual environment files are ignored by Git. This keeps local secrets, deployment secrets, and machine-specific values out of version control.

### Deployment infrastructure

`infra/render` contains Terraform configuration for Render-hosted infrastructure.

Key files:

```text
infra/render/
├─ main.tf
├─ outputs.tf
├─ variables.tf
├─ versions.tf
└─ README.md
```

The Render Terraform configuration manages:

- A PostgreSQL database.
- A Redis key-value instance.
- The API web service.
- The customer web service.
- The admin web service.
- Environment variables wired between services.
- Docker-based deploys for the API, web app, and admin app.

Terraform state is stored remotely in Terraform Cloud according to `infra/render/versions.tf`. Render API credentials and sensitive runtime secrets are supplied through environment variables or Terraform variables, not committed files.

## Documentation organization

Project documentation is stored in `docs/` and root-level context files:

- `CONTEXT.md` gives a high-level product, architecture, and operational overview.
- `docs/cicd.md` documents CI/CD workflows and deployment expectations.
- `docs/observability-implementation.md` documents monitoring and operational visibility.
- `docs/grafana-cloud-dashboard.md` documents Grafana dashboard setup.
- `docs/project-structure-management-version-control.md` documents repository structure, management, and version control.
- `infra/render/README.md` documents Render infrastructure setup.
- App-specific README files provide package-level instructions where needed.

Documentation should be updated when repository structure, commands, deployment behavior, or ownership boundaries change.

## CI/CD management

GitHub Actions workflows live in `.github/workflows`.

The repository currently defines workflows for:

| Workflow                 | Purpose                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| `ci-validate.yml`        | Validate formatting, linting, tests, and builds across the monorepo. |
| `pr-master-validate.yml` | Validate pull requests targeting `master`.                           |
| `pipeline-api.yml`       | API CI/CD pipeline.                                                  |
| `pipeline-web.yml`       | Customer web CI/CD pipeline.                                         |
| `pipeline-admin.yml`     | Admin CI/CD pipeline.                                                |
| `pipeline-mobile.yml`    | Mobile CI/CD pipeline.                                               |
| `cd-render-iac.yml`      | Render infrastructure deployment workflow.                           |

The reusable action `.github/actions/setup-environment/action.yml` standardizes CI setup:

1. Check out the repository.
2. Set up Node.js.
3. Set up `pnpm`.
4. Restore the `pnpm` store cache.
5. Install dependencies with `pnpm install --frozen-lockfile`.

The CI/CD design keeps application validation and deployment concerns separated while sharing common environment setup.

## Version control model

The repository is version controlled with Git and hosted on GitHub at `NDTruongDanh/UITFood`.

### Main branch

The primary integration branch is `master`. Pull requests targeting `master` are validated by the PR workflow before they are merged.

Recommended branch flow:

1. Create a short-lived feature or fix branch from `master`.
2. Make focused commits for one logical change at a time.
3. Push the branch to GitHub.
4. Open a pull request into `master`.
5. Let GitHub Actions validate formatting, linting, tests, and builds.
6. Merge only after review and successful checks.

### Commit expectations

Recent commit history uses concise, descriptive commit messages such as `fix ...`, `chore ...`, and feature-specific summaries. Continue using messages that clearly describe the intent of the change.

Good commit messages should:

- Explain the user-visible or developer-visible change.
- Keep unrelated changes in separate commits.
- Avoid committing generated artifacts unless they are intentionally tracked.
- Avoid committing secrets, `.env` files, local caches, or dependency folders.

### Ignored files

`.gitignore` excludes dependencies, build outputs, caches, logs, local environment files, and generated artifacts. Important ignored categories include:

- `node_modules/`
- `.turbo/`
- `dist/`, `build/`, and coverage output
- Expo output
- local `.env` files
- logs
- Terraform local state artifacts

`.dockerignore` performs a similar role for Docker build contexts, keeping local dependencies, build output, Git metadata, Terraform files, and environment files out of Docker images.

### Lockfiles and reproducibility

`pnpm-lock.yaml` is tracked and should be updated whenever dependencies change. CI uses `pnpm install --frozen-lockfile`, so dependency changes must include a consistent lockfile update.

Dockerfiles and CI workflows depend on reproducible package installation through the lockfile and workspace definitions. This keeps local development, CI, and deployment builds aligned.

### Secrets and configuration safety

Secrets are managed outside Git:

- Local developers use `.env` files based on `.env.example`.
- GitHub Actions use repository or environment secrets.
- Terraform uses environment variables or Terraform Cloud variables.
- Render services receive runtime secrets through Terraform-managed environment variables.

Do not commit real credentials, private keys, production URLs with embedded credentials, service tokens, or generated secret files.

## Adding or changing project areas

When adding a new app, package, workflow, or infrastructure component:

1. Place application code under `apps/<name>` or shared library code under `packages/<name>`.
2. Add or update the package `scripts` expected by Turborepo, especially `build`, `lint`, `test`, and `dev` where applicable.
3. Confirm the package is covered by `pnpm-workspace.yaml`.
4. Update `turbo.json` if the task graph changes.
5. Add Docker, CI, or deployment configuration only when the new component needs it.
6. Update `.env.example` when new configuration variables are required.
7. Update documentation in `docs/` or the relevant app README.

This keeps the monorepo consistent and makes new components visible to local tooling, CI, and future contributors.
