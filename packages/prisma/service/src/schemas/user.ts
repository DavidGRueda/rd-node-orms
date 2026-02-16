import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const userStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'PENDING']);

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createUserBodySchema = z.object({
  email: z.string().min(1),
  status: userStatusEnum,
});

export const updateUserBodySchema = z.object({
  email: z.string().min(1).optional(),
  status: userStatusEnum.optional(),
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  status: userStatusEnum,
  createdAt: z.coerce.date(),
  deletedAt: z.date().nullable(),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

const jsonSchemaOptions = { $refStrategy: 'none' as const };

export const userIdParamJsonSchema = zodToJsonSchema(
  userIdParamSchema,
  jsonSchemaOptions,
) as Record<string, unknown>;

export const createUserBodyJsonSchema = zodToJsonSchema(
  createUserBodySchema,
  jsonSchemaOptions,
) as Record<string, unknown>;

export const updateUserBodyJsonSchema = zodToJsonSchema(
  updateUserBodySchema,
  jsonSchemaOptions,
) as Record<string, unknown>;

export const userJsonSchema = zodToJsonSchema(userResponseSchema, jsonSchemaOptions) as Record<
  string,
  unknown
>;
