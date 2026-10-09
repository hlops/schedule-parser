import { CheckJobDto } from './check';
import { ParseJobDto } from './parse';
import { ScheduleJobDto } from './schedule';
import { CalendarJobDto } from './upload';

export * from './check';
export * from './generic';
export * from './parse';
export * from './schedule';
export * from './upload';

export type AnyJobDto = CheckJobDto | ParseJobDto | ScheduleJobDto | CalendarJobDto;
