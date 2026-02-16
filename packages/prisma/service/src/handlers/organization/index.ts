import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  organizationIdParamSchema,
  createOrganizationBodySchema,
  updateOrganizationBodySchema,
  type OrganizationIdParam,
} from '@/schemas';
import { organizationService } from '@/services/organization.service';
import type { UpdateOrganizationDto } from '@/models';
import { ERROR_INVALID_ID, ERROR_ORGANIZATION_NOT_FOUND, ERROR_VALIDATION_FAILED } from './errors';

function sendInvalidId(reply: FastifyReply, parsed: { error: { flatten: () => unknown } }) {
  return reply.status(400).send({ error: ERROR_INVALID_ID, details: parsed.error.flatten() });
}

async function getExistingOrSend404(
  id: string,
  reply: FastifyReply,
): Promise<Awaited<ReturnType<typeof organizationService.getOrganizationById>> | null> {
  const organization = await organizationService.getOrganizationById(id);
  if (!organization || organization.deletedAt) {
    reply.status(404).send({ error: ERROR_ORGANIZATION_NOT_FOUND });
    return null;
  }
  return organization;
}

/** Build update DTO with only defined fields (for PATCH) */
function toUpdateDto(data: {
  name?: string;
  plan?: 'FREE' | 'PRO' | 'ENTERPRISE';
}): UpdateOrganizationDto {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined) as [
    keyof UpdateOrganizationDto,
    string,
  ][];
  return Object.fromEntries(entries) as UpdateOrganizationDto;
}

export async function listOrganizations(_request: FastifyRequest, reply: FastifyReply) {
  const organizations = await organizationService.listOrganizations();
  return reply.send(organizations);
}

export async function getOrganization(
  request: FastifyRequest<{ Params: OrganizationIdParam }>,
  reply: FastifyReply,
) {
  const parsed = organizationIdParamSchema.safeParse(request.params);
  if (!parsed.success) {
    return sendInvalidId(reply, parsed);
  }
  const existing = await getExistingOrSend404(parsed.data.id, reply);
  if (!existing) return;
  return reply.send(existing);
}

export async function createOrganization(
  request: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply,
) {
  const parsed = createOrganizationBodySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: ERROR_VALIDATION_FAILED, details: parsed.error.flatten() });
  }
  const newOrganization = await organizationService.createOrganization({
    name: parsed.data.name,
    plan: parsed.data.plan,
  });
  return reply.send(newOrganization);
}

export async function updateOrganization(
  request: FastifyRequest<{ Params: OrganizationIdParam; Body: unknown }>,
  reply: FastifyReply,
) {
  const paramResult = organizationIdParamSchema.safeParse(request.params);
  if (!paramResult.success) {
    return sendInvalidId(reply, paramResult);
  }
  const bodyResult = updateOrganizationBodySchema.safeParse(request.body);
  if (!bodyResult.success) {
    return reply
      .status(400)
      .send({ error: ERROR_VALIDATION_FAILED, details: bodyResult.error.flatten() });
  }
  const existing = await getExistingOrSend404(paramResult.data.id, reply);
  if (!existing) return;
  const updateData = toUpdateDto(bodyResult.data);
  const updated = await organizationService.updateOrganization(paramResult.data.id, updateData);
  return reply.send(updated);
}

export async function deleteOrganization(
  request: FastifyRequest<{ Params: OrganizationIdParam }>,
  reply: FastifyReply,
) {
  const parsed = organizationIdParamSchema.safeParse(request.params);
  if (!parsed.success) {
    return sendInvalidId(reply, parsed);
  }
  const existing = await getExistingOrSend404(parsed.data.id, reply);
  if (!existing) return;
  await organizationService.softDeleteOrganization(parsed.data.id);
  return reply.status(204).send();
}
