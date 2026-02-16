import { ZodTypeAny } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export function toJsonSchema(
  schema: ZodTypeAny,
  options = { $refStrategy: 'none' as const },
): Record<string, unknown> {
  // Avoid TS2589: zod-to-json-schema's generics are too deep for inference.
  return zodToJsonSchema(schema as any, options) as Record<string, unknown>;
}
