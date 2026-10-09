import { JobDto } from './generic';

export interface CheckJobDto extends JobDto {
  metrics?: Record<string, number>;
}
