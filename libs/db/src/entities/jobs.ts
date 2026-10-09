import { CalendarEventDto, ClassScheduleDto, CalendarInstance } from '@schedule-parser/shared';

export interface Job {
  id: string;
  fileName: string;
  type: 'check' | 'parse' | 'schedule' | 'upload';
  status: 'new' | 'processing' | 'pending' | 'done' | 'error';
  error?: string;
  startAt: number;
  finishedAt?: number;
}

/** Метрики изображения для CheckJob */
export interface ImageMetrics {
  width: number;
  height: number;
  avgSaturation: number;
  avgLuminance: number;
  whiteRatio: number;
  colorDiversity: number;
  grayscale: number;
  entropy: number;
}

export interface CheckJob extends Job {
  metrics?: ImageMetrics;
}

export interface ParseJob extends Job {
  model?: string;
  parseAttempt: number,
  response?: string;
}

export interface ScheduleJob extends Job {
  date: number;
  classes: ClassScheduleDto[];
}

export interface UploadJob extends Job {
  date: number;
  calendar: CalendarInstance;
  events: CalendarEventDto[];
}
