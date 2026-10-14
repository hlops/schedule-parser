import { Data, getDb, Job } from '@schedule-parser/db';
import { createCheckJob, processCheckJob } from './checks';
import { CalendarJobDto, CheckJobDto, ParseJobDto, ScheduleJobDto } from '@schedule-parser/shared';
import { processParseJob } from './parse';
import { processScheduleJob } from './schedule';
import { processUploadJob } from './upload';
import { Low } from 'lowdb';

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

const processJob = (db: Low<Data>, job: Job) => {
  switch (job.type) {
    case 'check':
      return processCheckJob(job as CheckJobDto);
    case 'parse':
      return processParseJob(db, job as ParseJobDto);
    case 'schedule':
      return processScheduleJob(job as ScheduleJobDto);
    case 'upload':
      return processUploadJob(job as CalendarJobDto);
  }
};

let busy = false;
let needSave = false;
let isFirstIteration = true;

/** Обрабатывает все задачи, готовые к запуску (status: 'new' и startAt <= now) */
export const processJobs = async (): Promise<void> => {
  if (!busy) {
    const db = await getDb();
    needSave = false;

    try {
      const now = Date.now();
      const permittedStates = isFirstIteration ? ['new', 'processing', 'pending'] : ['new', 'pending'];
      isFirstIteration = false;
      const readyJobs = db.data.jobs.filter(job => permittedStates.includes(job.status) && job.startAt <= now);

      for (const job of readyJobs) {
        job.status = 'processing';
        await db.write();

        processJob(db, job).then(() => {
          needSave = true;
        }).catch(err => {
          job.status = 'error';
          job.error = err instanceof Error ? err.message : String(err);
          job.finishedAt = Date.now();
        });
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
