import type { FastifyInstance } from 'fastify';
import {
  createImageHasher,
  digestImageHash,
  getImageFilename,
  getImagePath,
  imageMimeTypeError,
  imageTooLargeError,
  isAllowedImageMimeType,
  sendImageJobResponse
} from '../utils/images';
import { MAX_IMAGE_SIZE_BYTES, UPLOADS_DIR } from '@schedule-parser/shared';
import { rename, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'node:fs';

export default async function(fastify: FastifyInstance) {
  fastify.post('/api/images/base64', async (request, reply) => {
    const body = request.body as {
      mimeType?: string;
      base64Data?: string;
    };

    const { mimeType, base64Data } = body;

    if (!mimeType || !base64Data) {
      return reply.code(400).send({ error: 'Нужны mimeType и base64Data' });
    }

    if (!isAllowedImageMimeType(mimeType)) {
      return reply.code(415).send(imageMimeTypeError(mimeType));
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64Data, 'base64');
    } catch {
      return reply.code(400).send({ error: 'Некорректный base64Data' });
    }

    // Проверяем размер после декодирования
    if (buffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
      return reply.code(413).send(imageTooLargeError());
    }

    const hash = digestImageHash(createImageHasher().update(buffer));
    const fileName = getImageFilename(hash, mimeType);

    // Сохраняем файл: имя строится от хэша, поэтому повторная запись идемпотентна
    await writeFile(getImagePath(fileName), buffer);

    return sendImageJobResponse(fileName, reply);
  });

  fastify.post('/api/images', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ error: 'Файл не передан' });
    }

    if (!isAllowedImageMimeType(data.mimetype)) {
      data.file.resume();
      return reply.code(415).send(imageMimeTypeError(data.mimetype));
    }

    // Считаем хэш на лету, параллельно сохраняя во временный файл
    const hasher = createImageHasher();
    const tmpPath = join(UPLOADS_DIR, `.tmp-${randomUUID()}`);

    try {
      // Дублируем поток: в хэш и в файл
      data.file.on('data', (chunk) => hasher.update(chunk));
      await pipeline(data.file, createWriteStream(tmpPath));
    } catch (err) {
      request.log.error({ err }, 'Ошибка сохранения файла');
      await unlink(tmpPath).catch(console.error);
      return reply.code(500).send({ error: 'Не удалось сохранить файл' });
    }

    if (data.file.truncated) {
      await unlink(tmpPath).catch(console.error);
      return reply.code(413).send(imageTooLargeError());
    }

    const hash = digestImageHash(hasher);
    const fileName = getImageFilename(hash, data.mimetype);
    const imagePath = getImagePath(fileName);

    // Переименовываем tmp → финальное имя (атомарно)
    try {
      await rename(tmpPath, imagePath);
    } catch (e) {
      console.error(e);
      await unlink(tmpPath).catch(console.error);
    }

    return sendImageJobResponse(fileName, reply);
  });
}
