import type { FastifyInstance } from 'fastify';
import { membershipHandlers } from '@/handlers/membership';
import {
  membershipOrgIdParamJsonSchema,
  membershipParamsJsonSchema,
  createMembershipBodyJsonSchema,
  updateMembershipBodyJsonSchema,
  membershipJsonSchema,
  membershipWithUserJsonSchema,
} from '@/schemas';

export default async function membershipRoutes(fastify: FastifyInstance) {
  /** List memberships for org (include user to avoid N+1) */
  fastify.get('/:orgId/memberships', {
    schema: {
      tags: ['Memberships'],
      params: membershipOrgIdParamJsonSchema,
      response: {
        200: {
          description: 'List of memberships for organization (with user)',
          type: 'array',
          items: membershipWithUserJsonSchema,
        },
      },
    },
    handler: membershipHandlers.listMemberships,
  });

  /** Get one membership (composite key) */
  fastify.get('/:orgId/memberships/:userId', {
    schema: {
      tags: ['Memberships'],
      params: membershipParamsJsonSchema,
      response: {
        200: {
          description: 'Membership by composite key',
          ...membershipJsonSchema,
        },
      },
    },
    handler: membershipHandlers.getMembership,
  });

  /** Create membership */
  fastify.post('/:orgId/memberships', {
    schema: {
      tags: ['Memberships'],
      params: membershipOrgIdParamJsonSchema,
      body: createMembershipBodyJsonSchema,
      response: {
        200: {
          description: 'Created membership',
          ...membershipJsonSchema,
        },
      },
    },
    handler: membershipHandlers.createMembership,
  });

  /** Partial update (role only) */
  fastify.patch('/:orgId/memberships/:userId', {
    schema: {
      tags: ['Memberships'],
      params: membershipParamsJsonSchema,
      body: updateMembershipBodyJsonSchema,
      response: {
        200: {
          description: 'Updated membership',
          ...membershipJsonSchema,
        },
      },
    },
    handler: membershipHandlers.updateMembership,
  });

  /** Delete membership (hard delete) */
  fastify.delete('/:orgId/memberships/:userId', {
    schema: {
      tags: ['Memberships'],
      params: membershipParamsJsonSchema,
      response: {
        204: { description: 'No content', type: 'null' },
      },
    },
    handler: membershipHandlers.deleteMembership,
  });
}
