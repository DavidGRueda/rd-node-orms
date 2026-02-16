import { Organization } from '@/prisma/client';

export type OrganizationIdParams = { id: string };

export type CreateOrganizationDto = Omit<Organization, 'id' | 'createdAt' | 'deletedAt'>;
export type UpdateOrganizationDto = Partial<CreateOrganizationDto>;
