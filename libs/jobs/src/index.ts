import { getDb } from '@schedule-parser/db';
import { createCheckJob, processCheckJob } from './checks';
import { CheckJob, ParseJob, ScheduleJob } from '@schedule-parser/shared';
import { processParseJob } from './parse';
import { processScheduleJob } from './schedule';

/**
 * Функция процессинга картинки, стартующая цепочку джобов.
 *
 * @param fileName - Имя файла.
 */
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
      const readyJobs = db.data.jobs.filter(job => ['new', 'processing', 'pending'].includes(job.status) && job.startAt <= now);

      for (const job of readyJobs) {
        job.status = 'processing';
        await db.write();

        switch (job.type) {
          case 'check':
            await processCheckJob(job as CheckJob);
            break;
          case 'parse':
            await processParseJob(db, job as ParseJob);
            break;
          case 'schedule':
            await processScheduleJob(job as ScheduleJob)
            break;
        }
      }
    } finally {
      await db.write();
      busy = false;
    }
  }
};

