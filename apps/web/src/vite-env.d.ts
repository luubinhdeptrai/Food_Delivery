/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_COMMIT_SHA?: string;
  readonly VITE_GRAFANA_FARO_COLLECTOR_URL?: string;
  readonly VITE_GRAFANA_FARO_APP_NAME?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
