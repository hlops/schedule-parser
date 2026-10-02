import { getDb } from '@schedule-parser/db';
import { FastifyTypeBox } from '../types';
import { JobDtoSchema, PageDtoSchema, PageQueryDtoSchema } from '../../generated/typebox';
import { getPage } from '../utils/common';
import { JobDto } from '@schedule-parser/dto';
import { Type } from '@sinclair/typebox';

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
}
