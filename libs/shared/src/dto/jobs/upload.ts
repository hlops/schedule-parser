import { JobDto } from './generic';
import { CalendarEventDto } from './schedule';
import { CalendarInstance } from '../calendar';

export interface CalendarJobDto extends JobDto {
  date: number;
  calendar: CalendarInstance;
  events: CalendarEventDto[];
}
