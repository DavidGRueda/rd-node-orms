import type { FastifyInstance } from 'fastify';
import { userHandlers } from '@/handlers/user';
import {
  createUserBodyJsonSchema,
  userIdParamJsonSchema,
  userJsonSchema,
  updateUserBodyJsonSchema,
} from '@/schemas';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    schema: {
      tags: ['Users'],
      response: {
        200: {
          description: 'List of users',
          type: 'array',
          items: userJsonSchema,
        },
      },
    },
    handler: userHandlers.listUsers,
  });

  fastify.get('/:id', {
    schema: {
      tags: ['Users'],
      params: userIdParamJsonSchema,
      response: {
        200: {
          description: 'User by id',
          ...userJsonSchema,
        },
      },
    },
    handler: userHandlers.getUser,
  });

  fastify.post('/', {
    schema: {
      tags: ['Users'],
      body: createUserBodyJsonSchema,
      response: {
        200: {
          description: 'Created user',
          ...userJsonSchema,
        },
      },
    },
    handler: userHandlers.createUser,
  });

  fastify.patch('/:id', {
    schema: {
      tags: ['Users'],
      params: userIdParamJsonSchema,
      body: updateUserBodyJsonSchema,
      response: {
        200: {
          description: 'Updated user',
          ...userJsonSchema,
        },
      },
    },
    handler: userHandlers.updateUser,
  });

  fastify.delete('/:id', {
    schema: {
      tags: ['Users'],
      params: userIdParamJsonSchema,
      response: {
        204: { description: 'No content', type: 'null' },
      },
    },
    handler: userHandlers.deleteUser,
  });
}
