export interface PageQueryDto {
  /**
   * @default 0
   * @minimum 0
   * @description "Номер страницы"
   */
  from?: number;
  /**
   * @default 20
   * @minimum 1
   * @maximum 200
   * @description "Размер страницы"
   */
  pageSize?: number;
}

export interface PageDto<T> {
  /**
   * @description Список элементов (данных) на текущей странице
   */
  pages: T[];

  /**
   * @minimum 0
   * @description Общее количество элементов во всей выборке (на всех страницах)
   */
  total: number;
}
