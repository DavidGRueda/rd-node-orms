// We could define a Prisma model here, but we are not using it to avoid dependencies on the Prisma client in other packages.
export type Organization = {
  id: string;
  name: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  createdAt: Date;
  deletedAt: Date | null;
};

export type OrganizationIdParams = { id: string };

export type CreateOrganizationDto = Omit<Organization, 'id' | 'createdAt' | 'deletedAt'>;
export type UpdateOrganizationDto = Partial<CreateOrganizationDto>;
