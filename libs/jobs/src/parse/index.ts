import { ParseJob, UPLOADS_DIR } from '@schedule-parser/shared';
import { createJob } from '../job';
import { join } from 'node:path';
import { parseImage } from '@schedule-parser/gemini';
import { getDb } from '@schedule-parser/db';

export const createParseJob = (fileName: string): ParseJob => ({...createJob(fileName, 'parse'), parseAttempt: 0});

export const processParseJob = async (job: ParseJob): Promise<void> => {
  const db = await getDb();

  try {
    const filePath = join(UPLOADS_DIR, job.fileName);
    job.json = await parseImage(filePath);
    job.status = 'done';
    delete job.error;
  } catch (err) {
    job.status = 'error';
    job.error = err instanceof Error ? err.message : String(err);
  }

  job.finishedAt = Date.now();
  await db.write();
};

