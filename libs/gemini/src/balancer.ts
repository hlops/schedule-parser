import dayjs from 'dayjs';
import { ParseResult } from './types';
import { getDb } from '@schedule-parser/db';

const models = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash'
] as const;

type Model = (typeof models)[number];

interface Statistics {
  delayedUntil?: number;
  iteration: number;
  success: number;
  failures: number;
}

const getInterval = (iteration: number) => {
  switch (iteration) {
    case 1:
      return 5;
    case 2:
      return 10;
    case 3:
      return 20;
    case 4:
      return 40;
    default:
      return 600;
  }
};

const getRating = (stats: Statistics) => {
  if (stats.failures > 0) {
    return stats.success / stats.failures;
  } else {
    return stats.success > 0 ? Number.MAX_VALUE : 1;
  }
};

class GeminiBalancer {
  private statistics = models.reduce<Record<Model, Statistics>>((acc, name) => {
    acc[name] = {
      iteration: 0,
      success: 0,
      failures: 0
    };
    return acc;
  }, {} as Record<Model, Statistics>);

  constructor() {
    getDb().then(db => {
      this.statistics = {
        ...models.reduce<Record<Model, Statistics>>((acc, name) => {
          acc[name] = {
            iteration: 0,
            success: 0,
            failures: 0
          };
          return acc;
        }, {} as Record<Model, Statistics>),
        ...db.data.models
      };

      db.data.models = this.statistics;
    });
  }

  getAvailableModel() {
    return [...models]
      .filter(model => !this.statistics[model].delayedUntil || dayjs().isAfter(this.statistics[model].delayedUntil))
      .sort((a, b) => getRating(this.statistics[b]) - getRating(this.statistics[a]))
      .at(0);
  }

  update(model: Model, result: ParseResult, retryInfo?: number) {
    const statistic = this.statistics[model];
    if (result === 'success') {
      //
      statistic.success++;
      statistic.iteration = 0;
      statistic.delayedUntil = undefined;
    } else if (result === 'skip') {
      // pending
      return;
    } else {
      if (retryInfo) {
        // 429 - You exceeded your current quota
        statistic.delayedUntil = dayjs().add(getInterval(statistic.iteration), 'seconds').valueOf();
        statistic.iteration = 0;
      } else {
        // 503 - This model is currently experiencing high demand
        statistic.failures++;
        statistic.iteration++;
      }
    }
  }

  getNearestAvailableTime() {
    return Math.min(
      ...models.map(
        name => dayjs().add(this.statistics[name].delayedUntil || 0, 'seconds').valueOf()
      )
    );
  }
}

export const geminiBalancer = new GeminiBalancer();
