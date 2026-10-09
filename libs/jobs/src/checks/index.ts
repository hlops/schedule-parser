import { CheckJobDto } from '@schedule-parser/shared';
import { getDb } from '@schedule-parser/db';
import { createJob } from '../job';
import { analyzeImage } from './image-analyzer';
import { checkThresholds } from './thresholds';
import { createParseJob } from '../parse';

export const createCheckJob = (fileName: string): CheckJobDto => createJob(fileName, 'check');

/** Считает метрики изображения и сохраняет их в задачу */
export const processCheckJob = async (job: CheckJobDto): Promise<void> => {
  job.metrics = await analyzeImage(job.fileName);
  checkThresholds(job.metrics);
  job.status = 'done';
  job.finishedAt = Date.now();

  const db = await getDb();
  db.data.jobs.push(createParseJob(job.fileName));
};
