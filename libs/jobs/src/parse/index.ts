import { MAX_PARSE_ATTEMPTS, ParseJob } from '@schedule-parser/shared';
import { createJob, restartJob } from '../job';
import { geminiBalancer, parseImage, RetryDelayError } from '@schedule-parser/gemini';
import { createScheduleJob } from '../schedule';
import { Data, getDb } from '@schedule-parser/db';
import { Low } from 'lowdb';

export const createParseJob = (fileName: string): ParseJob => ({ ...createJob(fileName, 'parse'), parseAttempt: 0 });

const isRetryDelayError = (error?: unknown): error is RetryDelayError => {
  return Array.isArray((error as RetryDelayError)?.details);
};

const getRetryDelay = (error?: unknown) => {
  if (isRetryDelayError(error)) {
    const retryDelay = error.details.find((item) => item['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay;

    return retryDelay ? Number.parseInt(retryDelay) : undefined;
  }

  return undefined;
};

export const processParseJob = async (db: Low<Data>, job: ParseJob): Promise<void> => {
  const model = geminiBalancer.getAvailableModel();
  if (!model) {
    // Нет доступной модели, ждем.
    job.status = 'pending';
    job.startAt = geminiBalancer.getNearestAvailableTime();
    return;
  }

  try {
    const json = await parseImage(job, model);
    job.status = 'done';
    geminiBalancer.updateStatistics(model, 'success');

    // Создаем джобу загрузки расписания.
    db.data.jobs.push(createScheduleJob(job.fileName, json));
  } catch (error) {
    geminiBalancer.updateStatistics(model, 'error', getRetryDelay(error));
    if (error instanceof Error) {
      job.status = 'error';
      job.error = error.message;

      if (job.parseAttempt < MAX_PARSE_ATTEMPTS) {
        // повторить
        await restartJob(job);
      }
    } else {
      job.status = 'error';
      job.error = String(error);
    }
  }

  job.finishedAt = Date.now();
};

