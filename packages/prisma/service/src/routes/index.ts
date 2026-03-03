import type { FastifyInstance } from 'fastify';
import organizationRoutes from './organization';
import membershipRoutes from './membership';
import userRoutes from './user';

export default async function routes(fastify: FastifyInstance) {
  // Membership routes first so /organizations/:orgId/memberships is matched before /organizations/:id
  fastify.register(membershipRoutes, { prefix: '/organizations' });
  fastify.register(organizationRoutes, { prefix: '/organizations' });
  fastify.register(userRoutes, { prefix: '/users' });
}
