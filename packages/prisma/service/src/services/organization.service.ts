import { prisma } from '@/_lib/prisma';
import type { CreateOrganizationDto, UpdateOrganizationDto } from '@/models';

async function listOrganizations() {
  return prisma.organization.findMany({
    where: { deletedAt: { not: null } },
  });
}

async function getOrganizationById(id: string) {
  return prisma.organization.findFirst({
    where: { id, deletedAt: null },
  });
}

async function createOrganization(data: CreateOrganizationDto) {
  return prisma.organization.create({
    data,
  });
}

async function updateOrganization(id: string, data: UpdateOrganizationDto) {
  return prisma.organization.update({
    where: { id },
    data,
  });
}

async function softDeleteOrganization(id: string) {
  return prisma.organization.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export const organizationService = {
  listOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  softDeleteOrganization,
};
