import { CheckJobDto } from '@schedule-parser/shared';
import { createJob } from '../job';
import { analyzeImage } from './image-analyzer';
import { checkThresholds } from './thresholds';

export const createCheckJob = (fileName: string): CheckJobDto => createJob(fileName, 'check');

/** Считает метрики изображения и сохраняет их в задачу */
export const processCheckJob = async (job: CheckJobDto): Promise<boolean> => {
  job.metrics = await analyzeImage(job.fileName);
  checkThresholds(job.metrics);
  return true;
};
