import { prisma } from '@/_lib/prisma';
import type { CreateUserDto, UpdateUserDto } from '@/models';

async function listUsers() {
  return await prisma.user.findMany({
    where: { deletedAt: null },
  });
}

async function getUserById(id: string) {
  return await prisma.user.findFirst({
    where: { id },
  });
}

async function createUser(data: CreateUserDto) {
  return await prisma.user.create({
    data,
  });
}

async function updateUser(id: string, data: UpdateUserDto) {
  return await prisma.user.update({
    where: { id },
    data,
  });
}

async function softDeleteUser(id: string) {
  return await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export const userService = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  softDeleteUser,
};
