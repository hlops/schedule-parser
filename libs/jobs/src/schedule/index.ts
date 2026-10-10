import { ClassScheduleDto, ParsedScheduleDto, ScheduleJobDto } from '@schedule-parser/shared';
import { createJob } from '../job';
import dayjs from 'dayjs';
import { calendarInstances } from '../constants';
import { getDb } from '@schedule-parser/db';
import { createUploadJob } from '../upload';

export const createScheduleJob = (fileName: string, json: ParsedScheduleDto):
  ScheduleJobDto => ({
  ...createJob(fileName, 'schedule'),
  date: dayjs(json.date).valueOf(),
  classes: json.classes
});

export const processScheduleJob = async (job: ScheduleJobDto): Promise<boolean> => {
  // получаем список классов
  for (const clz of job.classes as ClassScheduleDto[]) {
    const { grade } = clz as ClassScheduleDto;
    const calendarInstance = calendarInstances.find((ci) => ci.grade === grade);
    if (calendarInstance) {
      const db = await getDb();

      db.data.jobs.push(createUploadJob(job.fileName, {
        calendar: calendarInstance,
        date: job.date,
        events: clz.events
      }));
    }
  }

  job.status = 'done';

  return true;
};
