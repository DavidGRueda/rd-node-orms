import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  organizationIdParamSchema,
  createOrganizationBodySchema,
  updateOrganizationBodySchema,
  type OrganizationIdParam,
  CreateOrganizationBody,
} from '@/schemas';
import { organizationService } from '@/services/organization.service';
import { ERROR_INVALID_ID, ERROR_ORGANIZATION_NOT_FOUND, ERROR_VALIDATION_FAILED } from './errors';

async function getExistingOrSend404(id: string, reply: FastifyReply) {
  const organization = await organizationService.getOrganizationById(id);
  if (!organization || organization.deletedAt) {
    reply.status(404).send({ error: ERROR_ORGANIZATION_NOT_FOUND });
    return;
  }
  return organization;
}

async function listOrganizations(_request: FastifyRequest, reply: FastifyReply) {
  const organizations = await organizationService.listOrganizations();
  return reply.send(organizations);
}

async function getOrganization(
  request: FastifyRequest<{ Params: OrganizationIdParam }>,
  reply: FastifyReply,
) {
  const parsed = organizationIdParamSchema.safeParse(request.params);

  if (!parsed.success) {
    return reply.status(400).send({ error: ERROR_INVALID_ID, details: parsed.error.flatten() });
  }

  const organization = await getExistingOrSend404(parsed.data.id, reply);
  return reply.send(organization);
}

async function createOrganization(
  request: FastifyRequest<{ Body: CreateOrganizationBody }>,
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

async function updateOrganization(
  request: FastifyRequest<{ Params: OrganizationIdParam; Body: unknown }>,
  reply: FastifyReply,
) {
  const parsedParams = organizationIdParamSchema.safeParse(request.params);
  if (!parsedParams.success) {
    return reply
      .status(400)
      .send({ error: ERROR_INVALID_ID, details: parsedParams.error.flatten() });
  }
  const parsedBody = updateOrganizationBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    return reply
      .status(400)
      .send({ error: ERROR_VALIDATION_FAILED, details: parsedBody.error.flatten() });
  }

  await getExistingOrSend404(parsedParams.data.id, reply);
  const updatedOrganization = await organizationService.updateOrganization(
    parsedParams.data.id,
    parsedBody.data,
  );
  return reply.send(updatedOrganization);
}

async function deleteOrganization(
  request: FastifyRequest<{ Params: OrganizationIdParam }>,
  reply: FastifyReply,
) {
  const parsed = organizationIdParamSchema.safeParse(request.params);
  if (!parsed.success) {
    return reply.status(400).send({ error: ERROR_INVALID_ID, details: parsed.error.flatten() });
  }
  await getExistingOrSend404(parsed.data.id, reply);
  await organizationService.softDeleteOrganization(parsed.data.id);
  return reply.status(204).send();
}

export const organizationHandlers = {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
};
