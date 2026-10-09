import { JobDto } from './generic';

export interface ParseJobDto extends JobDto {
  model?: string;
  parseAttempt: number,
  response?: string;
}

