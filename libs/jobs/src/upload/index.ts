import { CalendarJobDto } from '@schedule-parser/shared';
import { createJob } from '../job';

export const createUploadJob = (fileName: string, props: Pick<CalendarJobDto, 'date' | 'calendar' | 'events'>): CalendarJobDto => ({ ...props, ...createJob(fileName, 'upload') });

export const processUploadJob = (job: CalendarJobDto)  => {
  return false
};
