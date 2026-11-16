import { Data, getDb, Job } from '@schedule-parser/db';
import { createCheckJob, processCheckJob } from './checks';
import {
  CalendarJobDto,
  CheckJobDto,
  MAX_PARSE_ATTEMPTS,
  ParsedScheduleDto,
  ParseJobDto,
  ScheduleJobDto
} from '@schedule-parser/shared';
import { createParseJob, processParseJob } from './parse';
import { createChainedUploadJob, createScheduleJob, processScheduleJob } from './schedule';
import { processUploadJob } from './upload';
import { Low } from 'lowdb';
import { restartJob } from './job';

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

const processJob = (job: Job) => {
  switch (job.type) {
    case 'check':
      return processCheckJob(job as CheckJobDto);
    case 'parse':
      return processParseJob(job as ParseJobDto);
    case 'schedule':
      return processScheduleJob(job as ScheduleJobDto);
    case 'upload':
      return processUploadJob(job as CalendarJobDto);
  }
};

const createChainedJob = (db: Low<Data>, job: Job, result: boolean | ParsedScheduleDto) => {
  console.debug('create chained job from', JSON.stringify(job, undefined, 2));
  switch (job.type) {
    case 'check':
      db.data.jobs.push(createParseJob(job.fileName));
      break;
    case 'parse':
      db.data.jobs.push(createScheduleJob(job.fileName, result as ParsedScheduleDto));
      break;
    case 'schedule':
      createChainedUploadJob(db, job as ScheduleJobDto);
      break;
    case 'upload':
      break;
  }
};

const restartErrorJob = async (db: Low<Data>, job: Job) => {
  console.debug('restart error job', JSON.stringify(job, undefined, 2));
  if (job.type === 'parse') {
    if ((job as ParseJobDto).parseAttempt < MAX_PARSE_ATTEMPTS) {
      // повторить
      await restartJob(db, job);
    }
  }
};

let busy = false;
let needSave = false;
let isFirstIteration = true;

/** Обрабатывает все задачи, готовые к запуску (status: 'new' и startAt <= now) */
export const processJobs = async (): Promise<void> => {
  if (!busy) {
    busy = true;
    const db = await getDb();
    needSave = false;

    try {
      const now = Date.now();
      const permittedStates = isFirstIteration ? ['new', 'processing', 'pending'] : ['new', 'pending'];
      isFirstIteration = false;
      const readyJobs = db.data.jobs.filter(job => permittedStates.includes(job.status) && job.startAt <= now);

      for (const job of readyJobs) {
        needSave = job.status !== 'processing';
        job.status = 'processing';

        try {
          console.debug('processing job', JSON.stringify(job, undefined, 2));
          const result = await processJob(job);
          if (result) {
            console.debug('processed ok');
            needSave = true;
            job.status = 'done';
            job.finishedAt = Date.now();

            createChainedJob(db, job, result);
          } else {
            job.status = 'pending';
            console.debug('job was pended');
          }
        } catch (err) {
          needSave = true;
          job.finishedAt = Date.now();
          job.status = 'error';
          job.error = err instanceof Error ? err.message : String(err);
        }

        if (job.status === 'error') {
          await restartErrorJob(db, job);
        }
      }
    } finally {
      if (needSave) {
        console.debug('writing modified jobs to db');
        await db.write();
      }
      busy = false;
    }
  }
};

export { restartJob } from './job';
