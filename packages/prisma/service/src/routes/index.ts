import type { FastifyInstance } from 'fastify';
import organizationRoutes from './organization';
import userRoutes from './user';

export default async function routes(fastify: FastifyInstance) {
  fastify.register(organizationRoutes, { prefix: '/organizations' });
  fastify.register(userRoutes, { prefix: '/users' });
}
