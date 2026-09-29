import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';
import { MAX_IMAGE_SIZE_BYTES } from '@schedule-parser/shared';

/**
 * Fastify plugin to parse the multipart content-type.
 *
 * @see https://github.com/fastify/fastify-multipart
 */
export default fp(async function(fastify: FastifyInstance) {
  fastify.register(multipart, {
    limits: {
      fieldNameSize: 100,           // Max field name size in bytes
      fieldSize: 100,               // Max field value size in bytes
      fields: 10,                   // Max number of non-file fields
      fileSize: MAX_IMAGE_SIZE_BYTES, // For multipart forms, the max file size in bytes
      files: 1,                     // Max number of file fields
      headerPairs: 2000,            // Max number of header key=>value pairs
      parts: 1000                   // For multipart forms, the max number of parts (fields + files)
    }
  });
});
