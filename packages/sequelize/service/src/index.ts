import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

const port = Number(process.env.SERVICE_PORT) || 3003;

fastify.get('/', (req, res) => {
  res.send('Sequelize Service');
});

fastify.listen({ port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Sequelize service is running on ${address}`);
});
