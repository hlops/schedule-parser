import { PageDto } from '@schedule-parser/dto';

export const getPage = <T>(entities: T[], from: number, pageSize: number): PageDto<T> => ({
  pages: entities.slice(from, from + pageSize),
  total: entities.length,
});
