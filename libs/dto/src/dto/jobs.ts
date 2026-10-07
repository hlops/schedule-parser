export interface JobDto {
  id: string;
  fileName: string;
  type: 'check' | 'parse' | 'schedule';
  status: 'new' | 'processing' | 'pending' | 'done' | 'error';
  error?: string;
  startAt: number;
  finishedAt?: number;
}

export interface JobFullDto extends JobDto {
  metrics?: Record<string, number>;
  model?: string;
  parseAttempt?: number;
  response?: string;
  date?: number;
  classes?: unknown;
}
