export interface Job {
  fileName: string;
  type: 'check' | 'parse' | 'schedule'
  status: 'new' | 'done' | 'error';
  error?: string;
  iteration: number;
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
  parseAttempt: number,
  json?: string;
}

export interface ScheduleJob extends Job {
  schedule?: string;
}

export interface LogEntry {
  hash: string | null;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

