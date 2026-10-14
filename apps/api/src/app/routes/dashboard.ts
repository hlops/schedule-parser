import type { FastifyInstance } from 'fastify';
import { getDb, ParseJob } from '@schedule-parser/db';
import { Type } from '@sinclair/typebox';

export default async function(fastify: FastifyInstance) {
  fastify.get('/api/dashboard', {
    schema: {
      description: 'returns models statistic',
      tags: ['models', 'statistics'],
      summary: 'statistic of models usage',
      response: {
        200: Type.Any()
      }
    }
  }, async () => {
    const db = await getDb();

    const jobs = {
      jobs: db.data.jobs.reduce((acc, job) => {
        if (!acc[job.type]) {
          acc[job.type] = [0, 0];
        }

        if (job.error) {
          acc[job.type][1]++;
        } else {
          acc[job.type][0]++;
        }

        return acc;
      }, {})
    };

    const tokens = db.data.jobs.filter(({ type, error }) => type === 'parse' && !error).map((job: ParseJob) => {
      return ({
        total: job?.response?.usageMetadata?.totalTokenCount,
        model: job?.response?.modelVersion
      });
    });

    const models = db.data.jobs.filter(({ type }) => type === 'parse').reduce((acc, job: ParseJob) => {
      const model = job?.response?.modelVersion;

      if (model) {
        if (!acc[model]) {
          acc[model] = { count: 0, tokens: { totalCount: 0}}
        }

        acc[model] = ({
          count: acc[model].count + 1,
          tokens: {
            totalCount: acc[model].tokens.totalCount + job?.response?.usageMetadata?.totalTokenCount,
          }
        });
      }

      return acc;
    }, {});


    return { jobs, tokens, models };
  });
}
