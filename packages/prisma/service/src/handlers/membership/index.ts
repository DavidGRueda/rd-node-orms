import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  membershipOrgIdParamSchema,
  membershipParamsSchema,
  createMembershipBodySchema,
  updateMembershipBodySchema,
  type MembershipOrgIdParam,
  type MembershipParams,
  type CreateMembershipBody,
} from '@/schemas';
import { membershipService } from '@/services/membership.service';
import { organizationService } from '@/services/organization.service';
import {
  ERROR_INVALID_ID,
  ERROR_MEMBERSHIP_NOT_FOUND,
  ERROR_ORGANIZATION_NOT_FOUND,
  ERROR_VALIDATION_FAILED,
} from './errors';

async function ensureOrgExistsOrSend404(orgId: string, reply: FastifyReply) {
  const org = await organizationService.getOrganizationById(orgId);
  if (!org || org.deletedAt) {
    reply.status(404).send({ error: ERROR_ORGANIZATION_NOT_FOUND });
    return false;
  }
  return true;
}

async function getExistingMembershipOrSend404(orgId: string, userId: string, reply: FastifyReply) {
  const membership = await membershipService.getMembership(orgId, userId);
  if (!membership) {
    reply.status(404).send({ error: ERROR_MEMBERSHIP_NOT_FOUND });
    return undefined;
  }
  return membership;
}

async function listMemberships(
  request: FastifyRequest<{ Params: MembershipOrgIdParam }>,
  reply: FastifyReply,
) {
  const parsed = membershipOrgIdParamSchema.safeParse(request.params);
  if (!parsed.success) {
    return reply.status(400).send({ error: ERROR_INVALID_ID, details: parsed.error.flatten() });
  }
  const ok = await ensureOrgExistsOrSend404(parsed.data.orgId, reply);
  if (!ok) return;
  const memberships = await membershipService.listMembershipsByOrgId(parsed.data.orgId);
  return reply.send(memberships);
}

async function getMembership(
  request: FastifyRequest<{ Params: MembershipParams }>,
  reply: FastifyReply,
) {
  const parsed = membershipParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    return reply.status(400).send({ error: ERROR_INVALID_ID, details: parsed.error.flatten() });
  }
  const membership = await getExistingMembershipOrSend404(
    parsed.data.orgId,
    parsed.data.userId,
    reply,
  );
  if (!membership) return;
  return reply.send(membership);
}

async function createMembership(
  request: FastifyRequest<{ Params: MembershipOrgIdParam; Body: CreateMembershipBody }>,
  reply: FastifyReply,
) {
  const parsedParams = membershipOrgIdParamSchema.safeParse(request.params);
  if (!parsedParams.success) {
    return reply
      .status(400)
      .send({ error: ERROR_INVALID_ID, details: parsedParams.error.flatten() });
  }
  const parsedBody = createMembershipBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    return reply
      .status(400)
      .send({ error: ERROR_VALIDATION_FAILED, details: parsedBody.error.flatten() });
  }
  const ok = await ensureOrgExistsOrSend404(parsedParams.data.orgId, reply);
  if (!ok) return;

  const newMembership = await membershipService.createMembership({
    userId: parsedBody.data.userId,
    organizationId: parsedParams.data.orgId,
    role: parsedBody.data.role,
  });

  return reply.send(newMembership);
}

async function updateMembership(
  request: FastifyRequest<{ Params: MembershipParams; Body: unknown }>,
  reply: FastifyReply,
) {
  const parsedParams = membershipParamsSchema.safeParse(request.params);
  if (!parsedParams.success) {
    return reply
      .status(400)
      .send({ error: ERROR_INVALID_ID, details: parsedParams.error.flatten() });
  }
  const parsedBody = updateMembershipBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    return reply
      .status(400)
      .send({ error: ERROR_VALIDATION_FAILED, details: parsedBody.error.flatten() });
  }
  const existing = await getExistingMembershipOrSend404(
    parsedParams.data.orgId,
    parsedParams.data.userId,
    reply,
  );
  if (!existing) return;
  const updated = await membershipService.updateMembership(
    parsedParams.data.orgId,
    parsedParams.data.userId,
    parsedBody.data,
  );
  return reply.send(updated);
}

async function deleteMembership(
  request: FastifyRequest<{ Params: MembershipParams }>,
  reply: FastifyReply,
) {
  const parsed = membershipParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    return reply.status(400).send({ error: ERROR_INVALID_ID, details: parsed.error.flatten() });
  }
  const membership = await getExistingMembershipOrSend404(
    parsed.data.orgId,
    parsed.data.userId,
    reply,
  );
  if (!membership) return;
  await membershipService.deleteMembership(parsed.data.orgId, parsed.data.userId);
  return reply.status(204).send();
}

export const membershipHandlers = {
  listMemberships,
  getMembership,
  createMembership,
  updateMembership,
  deleteMembership,
};
