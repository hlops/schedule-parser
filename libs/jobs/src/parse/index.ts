import { ParseJob, UPLOADS_DIR } from '@schedule-parser/shared';
import { createJob } from '../job';
import { join } from 'node:path';
import { geminiBalancer, parseImage } from '@schedule-parser/gemini';

export const createParseJob = (fileName: string): ParseJob => ({ ...createJob(fileName, 'parse'), parseAttempt: 0 });

export const processParseJob = async (job: ParseJob): Promise<void> => {
  try {
    const filePath = join(UPLOADS_DIR, job.fileName);
    job.json = await parseImage(filePath);
    job.status = 'done';
    job.finishedAt = Date.now();
  } catch (error) {
    if (error instanceof Error && error.name === 'NoAvailableModelError') {
      job.status = 'pending';
      job.startAt = geminiBalancer.getNearestAvailableTime();
    } else {
      job.status = 'error';
      job.error = error instanceof Error ? error.message : String(error);
    }
    job.finishedAt = Date.now();
  }
};
