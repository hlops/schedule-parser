export interface JobDto {
  id: string;
  fileName: string;
  type: 'check' | 'parse' | 'schedule';
  status: 'new' | 'processing' | 'pending' | 'done' | 'error';
  error?: string;
  iteration: number;
  startAt: number;
  finishedAt?: number;
}
