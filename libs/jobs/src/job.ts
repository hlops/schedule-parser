import { Job } from '@schedule-parser/shared';
import { Data, getDb } from '@schedule-parser/db';
import humanId from 'human-id';
import { Low } from 'lowdb';

export const createJob = (fileName: string, type: Job['type'], startAt = Date.now()): Job =>
  ({
    id: humanId(),
    fileName,
    type,
    iteration: 0,
    status: 'new',
    startAt
  });
