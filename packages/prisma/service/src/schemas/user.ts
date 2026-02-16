import { z } from 'zod';
import { toJsonSchema } from './schema.utils';

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

export const userIdParamJsonSchema = toJsonSchema(userIdParamSchema);
export const createUserBodyJsonSchema = toJsonSchema(createUserBodySchema);
export const updateUserBodyJsonSchema = toJsonSchema(updateUserBodySchema);
export const userJsonSchema = toJsonSchema(userResponseSchema);
