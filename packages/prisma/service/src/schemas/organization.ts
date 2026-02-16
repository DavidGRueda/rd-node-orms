import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const planTypeEnum = z.enum(['FREE', 'PRO', 'ENTERPRISE']);

export const organizationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createOrganizationBodySchema = z.object({
  name: z.string().min(1),
  plan: planTypeEnum,
});

export const updateOrganizationBodySchema = z.object({
  name: z.string().min(1).optional(),
  plan: planTypeEnum.optional(),
});

/** Response shape for a single organization (OpenAPI) */
export const organizationResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  plan: planTypeEnum,
  createdAt: z.coerce.date(),
  deletedAt: z.date().nullable(),
});

export type OrganizationIdParam = z.infer<typeof organizationIdParamSchema>;
export type CreateOrganizationBody = z.infer<typeof createOrganizationBodySchema>;
export type UpdateOrganizationBody = z.infer<typeof updateOrganizationBodySchema>;

const jsonSchemaOptions = { $refStrategy: 'none' as const };

export const organizationIdParamJsonSchema = zodToJsonSchema(
  organizationIdParamSchema,
  jsonSchemaOptions,
) as Record<string, unknown>;

export const createOrganizationBodyJsonSchema = zodToJsonSchema(
  createOrganizationBodySchema,
  jsonSchemaOptions,
) as Record<string, unknown>;

export const updateOrganizationBodyJsonSchema = zodToJsonSchema(
  updateOrganizationBodySchema,
  jsonSchemaOptions,
) as Record<string, unknown>;

export const organizationJsonSchema = zodToJsonSchema(
  organizationResponseSchema,
  jsonSchemaOptions,
) as Record<string, unknown>;
