import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

const port = Number(process.env.SERVICE_PORT) || 3000;

fastify.get('/', (req, res) => {
  res.send('Hello World');
});

fastify.listen({ port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is running on ${address}`);
});
