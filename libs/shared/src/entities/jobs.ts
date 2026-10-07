export interface Job {
  id: string;
  fileName: string;
  type: 'check' | 'parse' | 'schedule'
  status: 'new' | 'processing' | 'pending' | 'done' | 'error';
  error?: string;
  startAt: number;
  finishedAt?: number;
}

/** Метрики изображения для CheckJob */
interface ImageMetrics {
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
  classes: unknown;
}
