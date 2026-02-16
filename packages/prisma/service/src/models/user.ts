// We could define a Prisma model here, but we are not using it to avoid dependencies on the Prisma client in other packages.
export type User = {
  id: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: Date;
  deletedAt: Date | null;
};

export type UserIdParams = { id: string };

export type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'deletedAt'>;
export type UpdateUserDto = Partial<CreateUserDto>;
