import { ScheduleJob } from '@schedule-parser/shared';
import { createJob } from '../job';
import { ParsedScheduleSchema } from '@schedule-parser/dto';
import { Static } from '@sinclair/typebox';
import dayjs from 'dayjs';

export const createScheduleJob = (fileName: string, json: Static<typeof ParsedScheduleSchema>): ScheduleJob => ({
  ...createJob(fileName, 'schedule'),
  date: dayjs(json.date).valueOf(),
  classes: json.classes
});

export const processScheduleJob = async (job: ScheduleJob): Promise<void> => {
  job.status = 'done';
};
