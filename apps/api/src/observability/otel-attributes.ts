import type { LogAttributes } from '@opentelemetry/api-logs';

type AttributePrimitive = string | number | boolean;
type AttributeValue = AttributePrimitive | AttributePrimitive[] | undefined;

function toAttributeValue(value: unknown): AttributeValue {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (value === undefined || value === null) return undefined;

  if (Array.isArray(value)) {
    const primitiveValues = value.filter(
      (entry): entry is AttributePrimitive =>
        typeof entry === 'string' ||
        typeof entry === 'number' ||
        typeof entry === 'boolean',
    );

    if (primitiveValues.length === value.length) return primitiveValues;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return '[unserializable]';
  }
}

export function toLogAttributes(
  values: Record<string, unknown>,
  options: { omit?: string[]; prefix?: string } = {},
): LogAttributes {
  const omit = new Set(options.omit ?? []);
  const prefix = options.prefix ?? '';
  const attributes: LogAttributes = {};

  for (const [key, value] of Object.entries(values)) {
    if (omit.has(key)) continue;

    const attributeValue = toAttributeValue(value);
    if (attributeValue === undefined) continue;

    attributes[`${prefix}${key}`] = attributeValue;
  }

  return attributes;
}
