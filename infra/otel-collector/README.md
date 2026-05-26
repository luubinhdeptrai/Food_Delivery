# OpenTelemetry Collector

The default collector is for local development. It receives OTLP traces,
metrics, and logs from the API and writes summaries to the collector logs.

```powershell
docker compose up -d otel-collector
docker compose logs -f otel-collector
```

Use this API setting when the API runs on your host machine:

```env
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

If the API later runs inside Docker Compose, use the service DNS name instead:

```env
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

## Forward To Grafana Cloud

Use the Grafana Cloud OpenTelemetry details page to get the OTLP endpoint,
instance ID, and token. The endpoint normally ends in `/otlp`.

```env
GRAFANA_CLOUD_OTLP_ENDPOINT=https://otlp-gateway-prod-REGION.grafana.net/otlp
GRAFANA_CLOUD_OTLP_USERNAME_OR_INSTANCE_ID=<instance-id>
GRAFANA_CLOUD_OTLP_TOKEN=<access-policy-token>
```

Then run the collector with the Grafana Cloud override:

```powershell
docker compose -f docker-compose.yml -f docker-compose.otel-grafana.yml up -d otel-collector
docker compose -f docker-compose.yml -f docker-compose.otel-grafana.yml logs -f otel-collector
```
