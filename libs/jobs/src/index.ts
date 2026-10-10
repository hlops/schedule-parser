import { getDb } from '@schedule-parser/db';
import { createCheckJob, processCheckJob } from './checks';
import { CalendarJobDto, CheckJobDto, ParseJobDto, ScheduleJobDto } from '@schedule-parser/shared';
import { processParseJob } from './parse';
import { processScheduleJob } from './schedule';
import { processUploadJob } from './upload';

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
    let needSave = false;

    try {
      busy = true;

      const now = Date.now();
      const readyJobs = db.data.jobs.filter(job => ['new', 'processing', 'pending'].includes(job.status) && job.startAt <= now);

      for (const job of readyJobs) {
        job.status = 'processing';
        await db.write();

        try {
          switch (job.type) {
            case 'check':
              needSave = needSave || await processCheckJob(job as CheckJobDto);
              break;
            case 'parse':
              needSave = needSave || await processParseJob(db, job as ParseJobDto);
              break;
            case 'schedule':
              needSave = needSave || await processScheduleJob(job as ScheduleJobDto);
              break;
            case 'upload':
              needSave = needSave || await processUploadJob(job as CalendarJobDto);
              break;
          }
        } catch (err) {
          job.status = 'error';
          job.error = err instanceof Error ? err.message : String(err);
          job.finishedAt = Date.now();
        }
      }
    } finally {
      if (needSave) {
        console.log('writing');
        await db.write();
      }
      busy = false;
    }
  }
};

export { restartJob } from './job';
