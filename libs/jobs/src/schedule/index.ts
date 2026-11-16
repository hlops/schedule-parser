import { ClassScheduleDto, ParsedScheduleDto, ScheduleJobDto } from '@schedule-parser/shared';
import { createJob } from '../job';
import dayjs from 'dayjs';
import { calendarInstances } from '../constants';
import { Data } from '@schedule-parser/db';
import { createUploadJob } from '../upload';
import { Low } from 'lowdb';

export const createScheduleJob = (fileName: string, json: ParsedScheduleDto):
  ScheduleJobDto => ({
  ...createJob(fileName, 'schedule'),
  date: dayjs(json.date).valueOf(),
  classes: json.classes
});

export const processScheduleJob = async (_job: ScheduleJobDto): Promise<boolean> => {
  return true;
};

export const createChainedUploadJob = (db: Low<Data>, job: ScheduleJobDto) => {
  // получаем список классов
  for (const clz of job.classes as ClassScheduleDto[]) {
    const { grade } = clz as ClassScheduleDto;
    const calendarInstance = calendarInstances.find((ci) => ci.grade === grade);
    if (calendarInstance) {
      db.data.jobs.push(createUploadJob(job.fileName, {
        calendarId: calendarInstance.id,
        date: job.date,
        events: clz.events
      }));
    }
  }
};
