import { getDb } from '@schedule-parser/db';
import { createCheckJob, processCheckJob } from './checks';
import { createJob } from './job';
import { CheckJob, Job, ParseJob } from '@schedule-parser/shared';
import { processParseJob } from './parse';

export async function processImage(fileName: string): Promise<void> {
  const db = await getDb();
  if (db.data.jobs.some((job) => job.fileName === fileName)) {
    throw new Error(`Job ${fileName} already exists.`);
  }

  db.data.jobs.push(createCheckJob(fileName));
  await db.write();
}

let busy = false;

/** Обрабатывает все задачи, готовые к запуску (status: 'new' и startAt <= now) */
export const processJobs = async (): Promise<void> => {
  if (!busy) {
    const db = await getDb();

    try {
      busy = true;

      const now = Date.now();
      const readyJobs = db.data.jobs.filter(job => job.status === 'new' && job.startAt <= now);

      for (const job of readyJobs) {
        switch (job.type) {
          case 'check':
            await processCheckJob(job as CheckJob);
            break;
          case 'parse':
            await processParseJob(job as ParseJob);
            break;
          case 'schedule':
            break;
        }
      }
    } finally {
      await db.write();
      busy = false;
    }
  }
};

export const restartJob = async (job: Job): Promise<void> => {
  const db = await getDb();

  db.data.jobs.push({ ...createJob(job.fileName, job.type), iteration: job.iteration + 1 });
  await db.write();
};
