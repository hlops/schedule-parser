import { getDb } from '@schedule-parser/db';
import { FastifyTypeBox } from '../types';
import { JobDtoSchema, PageDtoSchema, PageQueryDtoSchema } from '../../generated/typebox';
import { getPage } from '../utils/common';

export default async function(fastify: FastifyTypeBox) {
  fastify.get('/api/jobs', {
    schema: {
      description: 'returns a list of all the available dictionaries',
      tags: ['dictionary', 'list'],
      summary: 'get available dictionaries',
      querystring: PageQueryDtoSchema,
      response: {
        200: PageDtoSchema(JobDtoSchema)
      }
    }
  }, async function(request) {
    const { from, pageSize } = request.query;

    const db = await getDb();
    return getPage(db.data.jobs, from, pageSize);
  });
}
