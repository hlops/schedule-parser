import { Job, ParseJob } from '@schedule-parser/shared';
import humanId from 'human-id';
import { getDb } from '@schedule-parser/db';

export const createJob = (fileName: string, type: Job['type'], startAt = Date.now()): Job =>
  ({
    id: humanId(),
    fileName,
    type,
    status: 'new',
    startAt
  });

export const restartJob = async (oldJob: Job): Promise<string> => {
  const db = await getDb();
  const newJob = { ...createJob(oldJob.fileName, oldJob.type) };
  if (newJob.type === 'parse') {
    (newJob as ParseJob).parseAttempt = (oldJob as ParseJob).parseAttempt + 1;
  }
  db.data.jobs.push(newJob);
  await db.write();
  return newJob.id;
};
