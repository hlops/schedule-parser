import { describe, expect, it } from 'vitest';
import { createUploadJob } from './index';

const date = new Date('01-01-2026').getTime();

describe('createUploadJob', () => {
  it('собирает джобу из переданных данных и полей базовой джобы', () => {
    expect(createUploadJob('value-fileName', { date, events: [], calendarId: 'value-calendar-id' })).toStrictEqual({
      id: expect.any(String),
      fileName: 'value-fileName',
      type: 'upload',
      status: 'new',
      date,
      events: [],
      calendarId: 'value-calendar-id',
      startAt: expect.any(Number),
    });
  });
});
