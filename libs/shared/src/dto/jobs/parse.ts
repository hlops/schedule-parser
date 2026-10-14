import { JobDto } from './generic';
import { GeminiResponse } from '../gemini';

export interface ParseJobDto extends JobDto {
  model?: string;
  parseAttempt: number,
  response?: string | GeminiResponse;
}

