import { MAX_PARSE_ATTEMPTS, ParsedScheduleDto, ParseJobDto } from '@schedule-parser/shared';
import { createJob, restartJob } from '../job';
import { geminiBalancer, parseImage, RetryDelayError } from '@schedule-parser/gemini';
import { createScheduleJob } from '../schedule';
import { Data } from '@schedule-parser/db';
import { Low } from 'lowdb';

export const createParseJob = (fileName: string): ParseJobDto => ({ ...createJob(fileName, 'parse'), parseAttempt: 0 });

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

export const processParseJob = async (job: ParseJobDto): Promise<boolean | ParsedScheduleDto> => {
  const model = geminiBalancer.getAvailableModel();
  if (!model) {
    // Wait for available model.
    job.startAt = geminiBalancer.getNearestAvailableTime();
    return false;
  }

  try {
    job.model = model;
    const json = await parseImage(job, model);
    geminiBalancer.updateStatistics(model, 'success');
    return json;
  } catch (err) {
    geminiBalancer.updateStatistics(model, 'error', getRetryDelay(err));
    throw err;
  }
};
