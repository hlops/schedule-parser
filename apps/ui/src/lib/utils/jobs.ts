import type { JobDto } from '@schedule-parser/shared';

export const computeJobsStatus = (jobs: JobDto[], type: JobDto['type']) => {
  return jobs.filter(job => job.type == type).at(-1)?.status;
}
