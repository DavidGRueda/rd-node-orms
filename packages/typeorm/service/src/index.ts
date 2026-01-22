import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

const port = Number(process.env.SERVICE_PORT) || 3002;

fastify.get('/', (req, res) => {
  res.send('TypeORM Service');
});

fastify.listen({ port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`TypeORM service is running on ${address}`);
});
