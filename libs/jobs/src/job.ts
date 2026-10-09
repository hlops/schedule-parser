import { JobDto, ParseJobDto } from '@schedule-parser/shared';
import humanId from 'human-id';
import { getDb } from '@schedule-parser/db';

export const createJob = (fileName: string, type: JobDto['type'], startAt = Date.now()): JobDto =>
  ({
    id: humanId(),
    fileName,
    type,
    status: 'new',
    startAt
  });

export const restartJob = async (oldJob: JobDto): Promise<string> => {
  const db = await getDb();
  const newJob = { ...createJob(oldJob.fileName, oldJob.type) };
  if (newJob.type === 'parse') {
    (newJob as ParseJobDto).parseAttempt = (oldJob as ParseJobDto).parseAttempt + 1;
  }
  db.data.jobs.push(newJob);
  await db.write();
  return newJob.id;
};
