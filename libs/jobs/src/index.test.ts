import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Data, getDb, Job } from '@schedule-parser/db';
import { processJobs } from './index';
import { processCheckJob } from './checks';
import { Low } from 'lowdb';

vi.mock('@schedule-parser/db', () => ({
  getDb: vi.fn(),
}));
vi.mock('./checks', () => ({
  processCheckJob: vi.fn(),
}));

const mockDb = {
  data: { jobs: [] as Job[] },
  write: vi.fn(),
} as unknown as Low<Data>;

const createMockJob = (overrides: Partial<Job> = {}): Job => ({
  id: 'job-1',
  fileName: 'test.jpg',
  type: 'check',
  status: 'new',
  startAt: Date.now(),
  ...overrides,
});

beforeEach(() => {
  vi.resetAllMocks();
  mockDb.data.jobs = [];
  (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);
  vi.mocked(processCheckJob).mockResolvedValue(true);
});

describe('processJobs race condition fix', () => {
  it('пропускает джобы со статусом done, не перезаписывая их в processing', async () => {
    const doneJob = createMockJob({ status: 'done' });
    mockDb.data.jobs.push(doneJob);

    await processJobs();

    expect(doneJob.status).toBe('done');
    expect(doneJob.finishedAt).toBeUndefined();
    expect(processCheckJob).not.toHaveBeenCalled();
    expect(mockDb.write).not.toHaveBeenCalled();
  });

  it('пропускает джобы со статусом error', async () => {
    const errorJob = createMockJob({ status: 'error', error: 'some error' });
    mockDb.data.jobs.push(errorJob);

    await processJobs();

    expect(errorJob.status).toBe('error');
    expect(processCheckJob).not.toHaveBeenCalled();
  });

  it('пропускает джобы со статусом processing (защита от гонки)', async () => {
    const processingJob = createMockJob({ status: 'processing' });
    mockDb.data.jobs.push(processingJob);

    await processJobs();

    expect(processingJob.status).toBe('processing');
    expect(processCheckJob).not.toHaveBeenCalled();
  });

  it('обрабатывает джобы со статусом new и устанавливает статус done', async () => {
    const newJob = createMockJob({ status: 'new' });
    mockDb.data.jobs.push(newJob);

    await processJobs();

    expect(newJob.status).toBe('done');
    expect(newJob.finishedAt).toBeDefined();
    expect(processCheckJob).toHaveBeenCalledWith(newJob);
    expect(mockDb.write).toHaveBeenCalled();
  });

  it('не перезаписывает статус done если джоб уже завершён', async () => {
    const job = createMockJob({ status: 'new' });
    mockDb.data.jobs.push(job);

    // Первый вызов завершает джоб
    await processJobs();
    expect(job.status).toBe('done');

    // Повторный вызов — джоб должен остаться done, не быть перезаписанным в processing
    await processJobs();

    expect(job.status).toBe('done');
    expect(processCheckJob).toHaveBeenCalledTimes(1);
  });

  it('обрабатывает только новые джобы, не трогая уже завершённые', async () => {
    const newJob = createMockJob({ status: 'new' });
    const doneJob = createMockJob({ status: 'done' });
    const errorJob = createMockJob({ status: 'error' });
    mockDb.data.jobs.push(newJob, doneJob, errorJob);

    await processJobs();

    expect(newJob.status).toBe('done');
    expect(doneJob.status).toBe('done');
    expect(errorJob.status).toBe('error');
    expect(processCheckJob).toHaveBeenCalledTimes(1);
    expect(processCheckJob).toHaveBeenCalledWith(newJob);
    expect(mockDb.write).toHaveBeenCalled();
  });
});