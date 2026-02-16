import type { FastifyInstance } from 'fastify';
import * as organizationHandlers from '@/handlers/organization';
import {
  createOrganizationBodyJsonSchema,
  organizationIdParamJsonSchema,
  organizationJsonSchema,
  updateOrganizationBodyJsonSchema,
} from '@/schemas';

export default async function organizationRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    schema: {
      tags: ['Organizations'],
      response: {
        200: {
          description: 'List of organizations',
          type: 'array',
          items: organizationJsonSchema,
        },
      },
    },
    handler: organizationHandlers.listOrganizations,
  });

  fastify.get('/:id', {
    schema: {
      tags: ['Organizations'],
      params: organizationIdParamJsonSchema,
      response: {
        200: {
          description: 'Organization by id',
          ...organizationJsonSchema,
        },
      },
    },
    handler: organizationHandlers.getOrganization,
  });

  fastify.post('/', {
    schema: {
      tags: ['Organizations'],
      body: createOrganizationBodyJsonSchema,
      response: {
        200: {
          description: 'Created organization',
          ...organizationJsonSchema,
        },
      },
    },
    handler: organizationHandlers.createOrganization,
  });

  fastify.patch('/:id', {
    schema: {
      tags: ['Organizations'],
      params: organizationIdParamJsonSchema,
      body: updateOrganizationBodyJsonSchema,
      response: {
        200: {
          description: 'Updated organization',
          ...organizationJsonSchema,
        },
      },
    },
    handler: organizationHandlers.updateOrganization,
  });

  fastify.delete('/:id', {
    schema: {
      tags: ['Organizations'],
      params: organizationIdParamJsonSchema,
      response: {
        204: { description: 'No content', type: 'null' },
      },
    },
    handler: organizationHandlers.deleteOrganization,
  });
}
