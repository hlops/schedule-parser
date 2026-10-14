import { CalendarJobDto } from '@schedule-parser/shared';
import { createJob } from '../job';
import { createEvent, getEventsForDate, excludeExistingEvents, redrawScript } from '@schedule-parser/ha';
import { calendarInstances } from '../constants';

export const createUploadJob = (fileName: string, props: Pick<CalendarJobDto, 'date' | 'calendarId' | 'events'>): CalendarJobDto => ({ ...props, ...createJob(fileName, 'upload') });

export const processUploadJob = async (job: CalendarJobDto): Promise<boolean>  => {
  const calendarInstance = calendarInstances.find(({id}) => id === job.calendarId);

  if (!calendarInstance) {
    throw new Error(`Calendar not found: ${job.calendarId}` );
  }

  const existingEvents = await getEventsForDate(calendarInstance.calendarId, job.date);

  if (existingEvents?.length) {
    for (const event of excludeExistingEvents(job.events, existingEvents)) {
      await createEvent(calendarInstance.calendarId, event);
    }

//    await redrawScript();
  }


  job.status = 'done';
  return true;
};
