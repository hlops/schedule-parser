import { PageDto } from '@schedule-parser/shared';

export const getPage = <T>(entities: T[], from: number, pageSize: number): PageDto<T> => ({
  pages: entities.slice(from, from + pageSize),
  total: entities.length,
});
