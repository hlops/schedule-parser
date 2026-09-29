import type { FastifyReply } from 'fastify';
import { createHash, type Hash } from 'node:crypto';
import { join } from 'node:path';
import { processImage } from '@schedule-parser/jobs';
import { ALLOWED_IMAGE_MIMES, MAX_IMAGE_SIZE_BYTES, UPLOADS_DIR } from '@schedule-parser/shared';

// Длина короткого хэша, который используется как идентификатор изображения и задачи
const HASH_LENGTH = 22;

/** Поддерживается ли формат изображения */
export function isAllowedImageMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_MIMES.includes(mimeType);
}

/** Тело ответа 415 для неподдерживаемого формата */
export function imageMimeTypeError(mimeType: string) {
  return {
    error: `Неподдерживаемый формат: ${mimeType}`,
    allowed: ALLOWED_IMAGE_MIMES
  };
}

/** Тело ответа 413 для слишком большого файла */
export function imageTooLargeError() {
  return { error: `Файл больше ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024} МБ` };
}

/** Хэшер sha256, который наполняется данными по мере чтения потока */
export function createImageHasher(): Hash {
  return createHash('sha256');
}

/** Короткий идентификатор изображения по наполненному хэшеру */
export function digestImageHash(hasher: Hash): string {
  return hasher.digest('base64url').slice(0, HASH_LENGTH);
}

/** Имя файла изображения: `<хэш>.<ext>` (jpeg → jpg) */
export function getImageFilename(hash: string, mimeType: string): string {
  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
  return `${hash}.${ext}`;
}

/** Путь к файлу изображения в UPLOADS_DIR */
export function getImagePath(fileName: string): string {
  return join(UPLOADS_DIR, fileName);
}

/**
 * Регистрирует задачу для изображения и отправляет ответ:
 * 200 — задача уже существует (дубликат), 201 — задача создана.
 */
export async function sendImageJobResponse(fileName: string, reply: FastifyReply) {
  try {
    await processImage(fileName);
  } catch {
    // Задача успела появиться параллельно
    return reply.code(200).send({ hash: fileName});
  }

  return reply.code(201).send({ hash: fileName });
}
