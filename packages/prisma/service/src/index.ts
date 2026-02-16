import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import routes from './routes';

const fastify = Fastify({
  logger: true,
});

const port = Number(process.env.SERVICE_PORT_PRISMA) || 4001;

fastify.get('/', (req, res) => {
  res.send('Prisma Service!!!');
});

async function start() {
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: { title: 'Prisma Service API', version: '1.0.0' },
    },
  });

  await fastify.register(routes);

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Bind to all interfaces so the service is reachable from other hosts (e.g. Docker).
  await fastify.listen({ port, host: '0.0.0.0' });
  fastify.log.info(`Prisma service is running on http://localhost:${port}`);
}

start().catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
