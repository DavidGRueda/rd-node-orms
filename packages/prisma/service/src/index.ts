import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

const port = Number(process.env.SERVICE_PORT_PRISMA) || 4001;

fastify.get('/', (req, res) => {
  res.send('Prisma Service');
});

fastify.listen({ port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Prisma service is running on ${address}`);
});
