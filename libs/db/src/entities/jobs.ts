import { CalendarEventDto, ClassScheduleDto, CalendarInstance, GeminiResponse } from '@schedule-parser/shared';

export interface Job {
  id: string;
  fileName: string;
  type: 'check' | 'parse' | 'schedule' | 'upload';
  status: 'new' | 'processing' | 'pending' | 'done' | 'error';
  error?: string;
  errorCode?: number;
  startAt: number;
  finishedAt?: number;
  archived?: boolean;
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
  parseAttempt?: number,
  response?: GeminiResponse;
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
