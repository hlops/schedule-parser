import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'node:path';
import { DB_DIR, Job } from '@schedule-parser/shared';
import { mkdir } from 'node:fs/promises';

// Типы для вашей БД
export interface Data {
  jobs: Job[];
  models: Record<string, unknown>;
}

// Синглтон-экземпляр
let instance: Low<Data> | null = null;

export async function getDb(): Promise<Low<Data>> {
  if (instance) return instance;

  // Путь к файлу: указываем относительно CWD
  mkdir(DB_DIR, { recursive: true }).catch(console.error);
  const file = join(DB_DIR, 'schedule.json');
  const adapter = new JSONFile<Data>(file);

  // Дефолтные данные, если файла нет
  const defaultData: Data = { jobs: [], models: {} };

  instance = new Low<Data>(adapter, defaultData);
  await instance.read();

  return instance;
}
