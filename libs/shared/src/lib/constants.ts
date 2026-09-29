import { join } from 'node:path';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');
export const DB_DIR =  join(process.cwd(), 'data');

// Поддерживаемые форматы изображений
export const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

// Максимальный размер загружаемого изображения — 20 МБ
export const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;
