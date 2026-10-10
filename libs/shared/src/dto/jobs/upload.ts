import { JobDto } from './generic';
import { CalendarEventDto } from './schedule';

export interface CalendarJobDto extends JobDto {
  date: number;
  calendarId: string;
  events: CalendarEventDto[];
}
