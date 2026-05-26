# Turborepo CI/CD and Render Deploy Hooks

This document explains how this repository validates, packages, and deploys the
UITFood food ordering platform.

The current deployment model does not use Terraform. Render services,
databases, environment groups, secrets, and registry credentials are managed in
the Render Dashboard. GitHub Actions builds Docker images, publishes them to
GitHub Container Registry (GHCR), and triggers Render deploy hooks with the
specific image tag to release.

## Repository Layout

- `apps/api`: NestJS API.
- `apps/web`: Vite/React restaurant dashboard.
- `apps/mobile`: Expo mobile app.
- `.github/actions/setup-environment`: shared Node/pnpm setup action.
- `.github/workflows`: CI/CD workflows.
- `docker-compose.yml`: local Postgres and Redis dependencies.
- `turbo.json`: monorepo task graph.

## Deployment Flow

The pipeline separates validation, packaging, and deployment:

1. Validate API, Web, and Mobile with lint, typecheck, tests, and build.
2. Build API and Web Docker images.
3. Push images to GHCR with branch and short-SHA tags.
4. Trigger the matching Render deploy hook with the published image reference.
5. Package the Expo mobile app separately.

The Render deploy step sends image references in this format:

```text
ghcr.io/<github-owner-lowercase>/<github-repo-lowercase>-<app>@sha-<short-sha>
```

For this repository, the default image repositories are:

```text
ghcr.io/ndtruongdanh/uitfood-api
ghcr.io/ndtruongdanh/uitfood-web
```

## Workflow Inventory

| Workflow                     | Trigger                                               | Purpose                                                                                         |
| ---------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pr-master-validate.yml`     | Pull requests targeting `master`                      | Runs shared validation before merge.                                                            |
| `pipeline-main.yml`          | Manual `workflow_dispatch`                            | Runs full validation, publishes API/Web images, deploys API/Web to Render, and packages Mobile. |
| `pipeline-api.yml`           | Push to `master` touching `apps/api/**`, or manual    | Validates API, publishes API image, deploys API image to Render.                                |
| `pipeline-web.yml`           | Push to `master` touching `apps/web/**`, or manual    | Validates Web, publishes Web image, deploys Web image to Render.                                |
| `pipeline-mobile.yml`        | Push to `master` touching `apps/mobile/**`, or manual | Validates and packages Mobile.                                                                  |
| `pipeline-render-deploy.yml` | Manual `workflow_dispatch`                            | Deploys an existing API and/or Web image tag to Render. Useful for rollback or redeploy.        |
| `ci-validate.yml`            | Reusable `workflow_call`                              | Shared monorepo validation workflow.                                                            |
| `cd-package-docker.yml`      | Reusable `workflow_call`                              | Builds and pushes API/Web Docker images to GHCR.                                                |
| `cd-deploy-render.yml`       | Reusable `workflow_call`                              | Calls a Render deploy hook with an image tag.                                                   |
| `cd-package-mobile.yml`      | Reusable `workflow_call`                              | Packages the Expo mobile app.                                                                   |

## Branch And Release Policy

- `master` is the release branch.
- Pull requests into `master` run validation only.
- API and Web pushes to `master` deploy automatically after validation and image publication.
- `pipeline-main.yml` is manual because it coordinates the whole monorepo.
- `pipeline-render-deploy.yml` is manual for controlled redeploys and rollbacks.

## Required GitHub Secrets

Validation and build secrets:

- `TURBO_TOKEN`
- `TURBO_TEAM`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `VNPAY_TMN_CODE`
- `VNPAY_HASH_SECRET`
- `VNPAY_URL`
- `VNPAY_RETURN_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EXPO_TOKEN`

Render deployment secrets:

- `RENDER_API_DEPLOY_HOOK`: deploy hook URL for the API Render service.
- `RENDER_WEB_DEPLOY_HOOK`: deploy hook URL for the Web Render service.

GitHub Actions uses the built-in `GITHUB_TOKEN` for GHCR publishing.

## Required GitHub Variables

- `VITE_API_BASE_URL`: API base URL baked into the Web image at build time.

## Render Setup

Create or configure the Render services in the Dashboard:

1. Create image-backed Render web services for API and Web.
2. Set the API service image repository to `ghcr.io/ndtruongdanh/uitfood-api`.
3. Set the Web service image repository to `ghcr.io/ndtruongdanh/uitfood-web`.
4. Configure Render registry credentials if the GHCR packages are private.
5. Configure runtime environment variables and environment groups in Render.
6. Configure Render Postgres or other managed resources in Render.
7. Copy each service deploy hook into the matching GitHub secret.

Render requires the `imgURL` passed to a deploy hook to match the service's
configured image repository, except for the tag or digest. Keep the Dashboard
image repository aligned with the GHCR image names generated by
`cd-package-docker.yml`.

## Docker Image Packaging

File: `.github/workflows/cd-package-docker.yml`

This reusable workflow:

1. Logs in to `ghcr.io` with `GITHUB_TOKEN`.
2. Sets up Docker Buildx.
3. Resolves the image repository from `github.repository` and the app name.
4. Generates Docker metadata and tags.
5. Builds and pushes the image with GitHub Actions cache.
6. Exposes `image_url`, `image_tag`, and `image_ref` outputs for deploy jobs.

The image tag used for Render deploys is `sha-<short-sha>`.

## Render Image Deployment

File: `.github/workflows/cd-deploy-render.yml`

This reusable workflow accepts:

- `app`: `api` or `web`.
- `gh_repository`: GitHub repository slug.
- `image_url`: optional image repository override.
- `image_tag`: optional image tag override.
- `image_ref`: optional full image reference override.

It calls the Render deploy hook with:

```bash
curl --get --data-urlencode "imgURL=${IMAGE_REF}" "${RENDER_DEPLOY_HOOK_URL}"
```

If no image tag is provided, the workflow uses the current commit short-SHA tag.

## API Pipeline

File: `.github/workflows/pipeline-api.yml`

The API pipeline:

1. Runs API lint, typecheck, audit, unit tests, build, migrations, and e2e tests.
2. Publishes the API Docker image through `cd-package-docker.yml`.
3. Deploys the published image through `cd-deploy-render.yml`.

The deploy job uses `RENDER_API_DEPLOY_HOOK`.

## Web Pipeline

File: `.github/workflows/pipeline-web.yml`

The Web pipeline:

1. Runs Web lint, typecheck, audit, unit tests, and build.
2. Publishes the Web Docker image through `cd-package-docker.yml`.
3. Deploys the published image through `cd-deploy-render.yml`.

The Web image bakes in `VITE_API_BASE_URL`, so changing that value requires a
new Web build and image deploy.

The deploy job uses `RENDER_WEB_DEPLOY_HOOK`.

## Main Pipeline

File: `.github/workflows/pipeline-main.yml`

The main pipeline:

1. Runs shared monorepo validation.
2. Publishes API and Web Docker images.
3. Deploys API and Web images to Render in separate jobs.
4. Packages Mobile through the Expo workflow.

## Manual Render Deploys And Rollbacks

File: `.github/workflows/pipeline-render-deploy.yml`

Use this workflow when you need to redeploy or roll back without rebuilding an
image.

Examples:

- Deploy only API with `target=api` and `api_image_tag=sha-1a2b3c4`.
- Deploy only Web with `target=web` and `web_image_tag=sha-5d6e7f8`.
- Deploy both services by selecting `target=both` and providing both tags.

If a tag input is blank, the workflow falls back to the current commit short-SHA
tag.

## Local Validation

Run the same package-level checks locally:

```powershell
pnpm --filter=api run lint
pnpm --filter=api run typecheck
pnpm --filter=api run test
pnpm --filter=web run lint
pnpm --filter=web run typecheck
pnpm --filter=web run test
pnpm --filter=mobile run lint
pnpm --filter=mobile run typecheck
pnpm --filter=mobile run test
```

Build Docker images locally:

```powershell
docker build -f apps/api/Dockerfile -t uitfood-api:local .
docker build -f apps/web/Dockerfile -t uitfood-web:local --build-arg VITE_API_BASE_URL=http://localhost:3000 .
```

## Operational Notes

- Do not reintroduce Terraform for these Render services unless the release
  model is intentionally changed again.
- Do not manage the same Render service with multiple competing release
  mechanisms.
- Keep GHCR package visibility and Render registry access aligned.
- Store application runtime secrets in Render, not in GitHub workflow files.
- Roll back by deploying a previous known-good `sha-<short-sha>` image tag.
