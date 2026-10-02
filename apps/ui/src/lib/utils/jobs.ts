import type { JobDto } from '@schedule-parser/dto';

export const computeJobsStatus = (jobs: JobDto[], type: JobDto['type']) => {
  return jobs.filter(job => job.type == type).at(-1)?.status;
}
