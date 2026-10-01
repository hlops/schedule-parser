export interface JobDto {
  id: string;
  fileName: string;
  type: 'check' | 'parse' | 'schedule';
  status: 'new' | 'done' | 'error';
  error?: string;
  iteration: number;
  startAt: number;
  finishedAt?: number;
}
