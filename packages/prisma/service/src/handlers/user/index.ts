import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  userIdParamSchema,
  createUserBodySchema,
  updateUserBodySchema,
  type UserIdParam,
  CreateUserBody,
} from '@/schemas';
import { userService } from '@/services';
import { ERROR_INVALID_ID, ERROR_USER_NOT_FOUND, ERROR_VALIDATION_FAILED } from './errors';

async function getExistingOrSend404(id: string, reply: FastifyReply) {
  const user = await userService.getUserById(id);
  if (!user || user.deletedAt) {
    reply.status(404).send({ error: ERROR_USER_NOT_FOUND });
    return;
  }
  return user;
}

async function listUsers(_request: FastifyRequest, reply: FastifyReply) {
  const users = await userService.listUsers();
  return reply.send(users);
}

async function getUser(request: FastifyRequest<{ Params: UserIdParam }>, reply: FastifyReply) {
  const parsed = userIdParamSchema.safeParse(request.params);

  if (!parsed.success) {
    return reply.status(400).send({ error: ERROR_INVALID_ID, details: parsed.error.flatten() });
  }

  const user = await getExistingOrSend404(parsed.data.id, reply);
  return reply.send(user);
}

async function createUser(request: FastifyRequest<{ Body: CreateUserBody }>, reply: FastifyReply) {
  const parsed = createUserBodySchema.safeParse(request.body);

  if (!parsed.success) {
    return reply
      .status(400)
      .send({ error: ERROR_VALIDATION_FAILED, details: parsed.error.flatten() });
  }

  const newUser = await userService.createUser({
    email: parsed.data.email,
    status: parsed.data.status,
  });

  return reply.send(newUser);
}

async function updateUser(
  request: FastifyRequest<{ Params: UserIdParam; Body: unknown }>,
  reply: FastifyReply,
) {
  const parsedParams = userIdParamSchema.safeParse(request.params);
  if (!parsedParams.success) {
    return reply
      .status(400)
      .send({ error: ERROR_INVALID_ID, details: parsedParams.error.flatten() });
  }
  const parsedBody = updateUserBodySchema.safeParse(request.body);
  if (!parsedBody.success) {
    return reply
      .status(400)
      .send({ error: ERROR_VALIDATION_FAILED, details: parsedBody.error.flatten() });
  }

  await getExistingOrSend404(parsedParams.data.id, reply);
  const updatedUser = await userService.updateUser(parsedParams.data.id, parsedBody.data);
  return reply.send(updatedUser);
}

async function deleteUser(request: FastifyRequest<{ Params: UserIdParam }>, reply: FastifyReply) {
  const parsed = userIdParamSchema.safeParse(request.params);
  if (!parsed.success) {
    return reply.status(400).send({ error: ERROR_INVALID_ID, details: parsed.error.flatten() });
  }
  await getExistingOrSend404(parsed.data.id, reply);
  await userService.softDeleteUser(parsed.data.id);
  return reply.status(204).send();
}

export const userHandlers = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
