import dayjs from 'dayjs';

const models = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash'
] as const;

export type Model = (typeof models)[number];

interface Statistics {
  delayedUntil?: number;
  iteration: number;
  success: number;
  failures: number;
}

const getInterval = (iteration: number) => {
  switch (iteration) {
    case 0:
      return 5;
    case 1:
      return 10;
    case 2:
      return 20;
    case 3:
      return 30;
    case 4:
      return 60;
    default:
      return 300;
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

  getAvailableModel() {
    const model = [...models]
      .filter(model => !this.statistics[model].delayedUntil || dayjs().isAfter(this.statistics[model].delayedUntil))
      .sort((a, b) => getRating(this.statistics[b]) - getRating(this.statistics[a]))
      .at(0);

    if (model) {
      const statistic = this.statistics[model];
      // set delayed while executing (mark model as busy for 3 minutes).
      statistic.delayedUntil = dayjs().add(3, 'minutes').valueOf();
    }
    return model;
  }

  updateStatistics(model: Model, result: 'success' | 'error', retryDelay?: number) {
    const statistic = this.statistics[model];
    if (result === 'success') {
      statistic.success++;
      statistic.iteration = 0;
      statistic.delayedUntil = undefined;
    } else if (result === 'error') {
      if (retryDelay) {
        // 429 - You exceeded your current quota
        statistic.delayedUntil = dayjs().add(retryDelay, 'seconds').valueOf();
        statistic.failures++;
        statistic.iteration = 0;
      } else {
        // 503 - This model is currently experiencing high demand
        statistic.delayedUntil = dayjs().add(getInterval(statistic.iteration), 'seconds').valueOf();
        statistic.failures++;
        statistic.iteration++;
      }
    }
  }

  getNearestAvailableTime() {
    return Math.min(
      ...models.map(
        name => this.statistics[name].delayedUntil || 0
      )
    );
  }
}

export const geminiBalancer = new GeminiBalancer();
