import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import faroUploader from '@grafana/faro-rollup-plugin';

const faroAppName = process.env.VITE_GRAFANA_FARO_APP_NAME ?? 'uitfood-web';
const faroBundleId =
  process.env.VITE_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  process.env.VITE_APP_VERSION ??
  'local';

const faroSourcemapEndpoint = process.env.GRAFANA_FARO_SOURCEMAP_ENDPOINT;
const faroSourcemapApiKey = process.env.GRAFANA_FARO_SOURCEMAP_API_KEY;
const faroAppId = process.env.GRAFANA_FARO_APP_ID;
const grafanaCloudStackId = process.env.GRAFANA_CLOUD_STACK_ID;

const shouldUploadFaroSourcemaps =
  !!faroSourcemapEndpoint &&
  !!faroSourcemapApiKey &&
  !!faroAppId &&
  !!grafanaCloudStackId;

const plugins = [react(), tailwindcss()];

if (shouldUploadFaroSourcemaps) {
  plugins.push(
    faroUploader({
      appName: faroAppName,
      endpoint: faroSourcemapEndpoint,
      apiKey: faroSourcemapApiKey,
      appId: faroAppId,
      stackId: grafanaCloudStackId,
      bundleId: faroBundleId,
      gzipContents: true,
      keepSourcemaps: false,
      recursive: true,
      verbose: process.env.CI === 'true',
    }),
  );
}

export default defineConfig({
  plugins,
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: { usePolling: true },
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
