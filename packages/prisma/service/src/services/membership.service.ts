import type {
  CreateMembershipDto,
  UpdateMembershipDto,
  Membership,
  MembershipWithUser,
} from '@/models';
import { prisma } from '@/_lib/prisma';

async function listMembershipsByOrgId(orgId: string): Promise<MembershipWithUser[]> {
  return await prisma.membership.findMany({
    where: { organizationId: orgId },
    include: {
      user: true,
    },
  });
}

async function getMembership(organizationId: string, userId: string): Promise<Membership | null> {
  return await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
}

async function createMembership(data: CreateMembershipDto): Promise<Membership> {
  return await prisma.membership.create({
    data,
  });
}

async function updateMembership(
  organizationId: string,
  userId: string,
  data: UpdateMembershipDto,
): Promise<Membership> {
  return await prisma.membership.update({
    where: { userId_organizationId: { userId, organizationId } },
    data,
  });
}

async function deleteMembership(organizationId: string, userId: string) {
  return await prisma.membership.delete({
    where: { userId_organizationId: { userId, organizationId } },
  });
}

export const membershipService = {
  listMembershipsByOrgId,
  getMembership,
  createMembership,
  updateMembership,
  deleteMembership,
};
