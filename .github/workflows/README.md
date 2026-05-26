# Workflow Organization

GitHub Actions only loads workflow files directly under `.github/workflows`, so
this directory is organized by filename prefix instead of nested folders.

## Pipelines

- `pipeline-main.yml`: full manually triggered CI/CD pipeline.
- `pr-master-validate.yml`: validates pull requests targeting `master` and
  notifies the PR author when validation fails.
- `pipeline-api.yml`: API-specific CI/CD pipeline.
- `pipeline-web.yml`: Web-specific CI/CD pipeline.
- `pipeline-mobile.yml`: Mobile-specific CI/CD pipeline.
- `pipeline-render-deploy.yml`: manual Render image deployment pipeline.

## CI

- `ci-validate.yml`: reusable validation workflow for checkout, setup,
  lint/typecheck, audit, test, and build.

## CD

- `cd-package-docker.yml`: reusable Docker build and GHCR push workflow.
- `cd-package-mobile.yml`: reusable mobile build package workflow.
- `cd-deploy-render.yml`: reusable Render deploy-hook workflow for GHCR images.
