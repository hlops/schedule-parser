import { ParseJob, UPLOADS_DIR } from '@schedule-parser/shared';
import { createJob } from '../job';
import { join } from 'node:path';

export const createParseJob = (fileName: string): ParseJob => ({...createJob(fileName, 'parse'), parseAttempt: 0});

export const processParseJob = async (job: ParseJob): Promise<void> => {
  try {
    const filePath = join(UPLOADS_DIR, job.fileName);
    console.log(filePath);
    job.json = '';
    job.status = 'done';
    delete job.error;
  } catch (err) {
    job.status = 'error';
    job.error = err instanceof Error ? err.message : String(err);
  } finally {
    //
  }
};

