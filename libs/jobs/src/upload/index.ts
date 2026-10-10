import { CalendarJobDto } from '@schedule-parser/shared';
import { createJob } from '../job';
import { createEvent } from '@schedule-parser/ha';
import { calendarInstances } from '../constants';

export const createUploadJob = (fileName: string, props: Pick<CalendarJobDto, 'date' | 'calendarId' | 'events'>): CalendarJobDto => ({ ...props, ...createJob(fileName, 'upload') });

export const processUploadJob = async (job: CalendarJobDto): Promise<boolean>  => {
  const calendarInstance = calendarInstances.find(({id}) => id === job.calendarId);

  if (!calendarInstance) {
    throw new Error(`Calendar not found: ${job.calendarId}` );
  }

  for (const event of job.events) {
    await createEvent(calendarInstance.calendarId, event);
  }

  job.status = 'done';
  return true;
};
