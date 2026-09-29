import { Job } from '@schedule-parser/shared';
import { getDb } from '@schedule-parser/db';

export const createJob = (fileName: string, type: Job['type'], startAt =  Date.now()): Job =>
  ({
    fileName,
    type,
    iteration: 0,
    status: 'new',
    startAt,
  });

export async function addJob(job: Job): Promise<void> {
  const db = await getDb();
  db.data.jobs.push(job);
  await db.write();
}
