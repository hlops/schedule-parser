import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import { UPLOADS_DIR } from '@schedule-parser/shared';

/**
 * Fastify plugin to serve static files from the uploads directory.
 *
 * Файлы доступны по префиксу `/uploads/<имя файла>`.
 *
 * @see https://github.com/fastify/fastify-static
 */
export default fp(async function(fastify: FastifyInstance) {
  fastify.register(fastifyStatic, {
    root: UPLOADS_DIR,
    prefix: '/uploads/',
    // Скрываем служебные файлы (например, временные `.tmp-*` при загрузке)
    dotfiles: 'ignore',
    index: false
  });
});

