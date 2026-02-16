import { Organization } from '@/prisma/client';

/** Shared params type for routes that take organization id (get/update/delete) */
export type OrganizationIdParams = { id: string };

export type CreateOrganizationDto = Omit<Organization, 'id' | 'createdAt' | 'deletedAt'>;
export type UpdateOrganizationDto = Partial<CreateOrganizationDto>;
