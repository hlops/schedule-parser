import { getDb } from '@schedule-parser/db';
import { FastifyTypeBox } from '../types';
import { JobDtoSchema, PageDtoSchema, PageQueryDtoSchema } from '../../generated/typebox';
import { getPage } from '../utils/common';
import { JobDto } from '@schedule-parser/dto';
import { Type } from '@sinclair/typebox';
import { restartJob } from '@schedule-parser/jobs';

export default async function(fastify: FastifyTypeBox) {
  fastify.get('/api/jobs', {
    schema: {
      description: 'returns a list of all the available dictionaries',
      tags: ['dictionary', 'list'],
      summary: 'get available dictionaries',
      querystring: PageQueryDtoSchema,
      response: {
        200: PageDtoSchema(Type.Array(JobDtoSchema))
      }
    }
  }, async request => {
    const { from, pageSize } = request.query;

    const db = await getDb();
    const groupedJobs = db.data.jobs.reduce<Record<string, JobDto[]>>((acc, value) => {
      if (!acc[value.fileName]) {
        acc[value.fileName] = [];
      }
      acc[value.fileName].push(value);
      return acc;
    }, {});

    const result = Object.keys(groupedJobs).reverse().map(key => groupedJobs[key], []);

    return getPage(result, from, pageSize);
  });

  fastify.put('/api/jobs/restart/:jobId', {
    schema: {
      description: 'restart job',
      params: Type.Object({
        jobId: Type.String()
      }),
      tags: ['dictionary', 'restart'],
      summary: 'restart job',
      response: {
        204: Type.Null(),
        400: Type.Object({ message: Type.String() }),
        404: Type.Object({ message: Type.String() }),
        409: Type.Object({ message: Type.String() })
      }
    }
  }, async (request, response) => {
    const db = await getDb();
    const job = db.data.jobs.find((job) => job.id === request.params.jobId);

    if (!job) {
      response.status(404).send({ message: 'Not found' });
    }

    if (job.status !== 'error') {
      response.status(409).send({ message: 'Invalid job status' });
    }

    try {
      await restartJob(job);
    } catch (e) {
      response.status(400).send({ message: e.message });
    }
  });
}
