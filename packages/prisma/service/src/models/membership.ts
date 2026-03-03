// We could define a Prisma model here, but we are not using it to avoid dependencies on the Prisma client in other packages.
import type { User } from './user';

export type MembershipRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

export type Membership = {
  userId: string;
  organizationId: string;
  role: MembershipRole;
  joinedAt: Date;
};

/** Membership with user included (for list endpoint to avoid N+1) */
export type MembershipWithUser = Membership & {
  user: User;
};

export type MembershipCompositeKey = {
  userId: string;
  organizationId: string;
};

export type CreateMembershipDto = Pick<Membership, 'userId' | 'organizationId' | 'role'>;
export type UpdateMembershipDto = Partial<Pick<Membership, 'role'>>;
