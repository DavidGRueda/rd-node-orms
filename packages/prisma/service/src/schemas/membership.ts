import { z } from 'zod';
import { toJsonSchema } from './schema.utils';
import { userResponseSchema } from './user';

const membershipRoleEnum = z.enum(['ADMIN', 'MEMBER', 'VIEWER']);

/** Params for list and create: orgId only */
export const membershipOrgIdParamSchema = z.object({
  orgId: z.string().uuid(),
});

/** Params for get one, update, delete: orgId + userId (composite key) */
export const membershipParamsSchema = z.object({
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const createMembershipBodySchema = z.object({
  userId: z.string().uuid(),
  role: membershipRoleEnum,
});

export const updateMembershipBodySchema = z.object({
  role: membershipRoleEnum.optional(),
});

export const membershipResponseSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  role: membershipRoleEnum,
  joinedAt: z.coerce.date(),
});

/** Membership with user (for list endpoint to avoid N+1) */
export const membershipWithUserResponseSchema = membershipResponseSchema.extend({
  user: userResponseSchema,
});

export type MembershipOrgIdParam = z.infer<typeof membershipOrgIdParamSchema>;
export type MembershipParams = z.infer<typeof membershipParamsSchema>;
export type CreateMembershipBody = z.infer<typeof createMembershipBodySchema>;
export type UpdateMembershipBody = z.infer<typeof updateMembershipBodySchema>;

export const membershipOrgIdParamJsonSchema = toJsonSchema(membershipOrgIdParamSchema);
export const membershipParamsJsonSchema = toJsonSchema(membershipParamsSchema);
export const createMembershipBodyJsonSchema = toJsonSchema(createMembershipBodySchema);
export const updateMembershipBodyJsonSchema = toJsonSchema(updateMembershipBodySchema);
export const membershipJsonSchema = toJsonSchema(membershipResponseSchema);
export const membershipWithUserJsonSchema = toJsonSchema(membershipWithUserResponseSchema);
