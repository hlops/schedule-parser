import Fastify from 'fastify';
import { app } from './app/app';
import { mkdir } from 'node:fs/promises';
import { UPLOADS_DIR } from '@schedule-parser/shared';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
  bodyLimit: 30 * 1024 * 1024 // 30 МБ для base64-роута
}).withTypeProvider<TypeBoxTypeProvider>();

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  server.log.info(`Получен ${signal}, завершаю работу...`);
  await server.close();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);
