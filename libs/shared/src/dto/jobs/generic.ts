export interface JobDto {
  id: string;
  fileName: string;
  type: 'check' | 'parse' | 'schedule' | 'upload';
  status: 'new' | 'processing' | 'pending' | 'done' | 'error';
  error?: string;
  startAt: number;
  finishedAt?: number;
}
