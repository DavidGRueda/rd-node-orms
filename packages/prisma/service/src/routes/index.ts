import type { FastifyInstance } from 'fastify';
import organizationRoutes from './organization';

export default async function routes(fastify: FastifyInstance) {
  fastify.register(organizationRoutes, { prefix: '/organizations' });
}
