import { trace } from '@opentelemetry/api';
import { recordException } from './errors';

const tracer = trace.getTracer(process.env.OTEL_SERVICE_NAME ?? 'uitfood-api');

export async function runObserved<T>(
  name: string,
  attributes: Record<string, string | number | boolean | undefined>,
  fn: () => Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(
    name,
    {
      attributes: Object.fromEntries(
        Object.entries(attributes).filter(([, value]) => value !== undefined),
      ),
    },
    async (span) => {
      try {
        return await fn();
      } catch (error) {
        recordException(error, {
          span: name,
          ...attributes,
        });
        throw error;
      } finally {
        span.end();
      }
    },
  );
}
