import { CalendarJobDto, JobDto, ParseJobDto } from '@schedule-parser/shared';
import humanId from 'human-id';
import { Data } from '@schedule-parser/db';
import { Low } from 'lowdb';

export const createJob = (fileName: string, type: JobDto['type'], startAt = Date.now()): JobDto =>
  ({
    id: humanId(),
    fileName,
    type,
    status: 'new',
    startAt
  });

export const restartJob = async (db: Low<Data>, oldJob: JobDto): Promise<string> => {
  const newJob = { ...createJob(oldJob.fileName, oldJob.type) };
  if (newJob.type === 'parse') {
    (newJob as ParseJobDto).parseAttempt = (oldJob as ParseJobDto).parseAttempt + 1;
  } else if (newJob.type === 'upload') {
    (newJob as CalendarJobDto).date = (oldJob as CalendarJobDto).date;
    (newJob as CalendarJobDto).calendarId = (oldJob as CalendarJobDto).calendarId;
    (newJob as CalendarJobDto).events = [...(oldJob as CalendarJobDto).events];
  }

  db.data.jobs.push(newJob);
  await db.write();
  return newJob.id;
};
