import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

const port = Number(process.env.SERVICE_PORT_DRIZZLE) || 4004;

fastify.get('/', (req, res) => {
  res.send('Drizzle Service');
});

fastify.listen({ port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Drizzle service is running on ${address}`);
});
