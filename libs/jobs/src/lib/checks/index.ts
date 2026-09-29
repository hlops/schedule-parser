import { CheckJob } from '@schedule-parser/shared';
import { getDb } from '@schedule-parser/db';
import { createJob } from '../job';
import { analyzeImage } from './image-analyzer';
import { checkThresholds } from './thresholds';
import { createParseJob } from '../parse';

export const createCheckJob = (fileName: string): CheckJob => createJob(fileName, 'check');

/** Считает метрики изображения и сохраняет их в задачу */
export const processCheckJob = async (job: CheckJob): Promise<void> => {
  const db = await getDb();

  try {
    job.metrics = await analyzeImage(job.fileName);
    checkThresholds(job.metrics);
    job.status = 'done';
    delete job.error;

    db.data.jobs.push(createParseJob(job.fileName));
  } catch (err) {
    job.status = 'error';
    job.error = err instanceof Error ? err.message : String(err);
  }

  job.finishedAt = Date.now();
  await db.write();
};
