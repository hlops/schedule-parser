import type { JobDto, PageDto } from '@schedule-parser/shared';

/** Значения по умолчанию из схемы `PageQueryDto` */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 200;

export interface JobsStoreOptions {
  /** Префикс URL API; пусто — тот же origin (в dev ходит через прокси) */
  baseUrl?: string;
  /** Размер страницы при создании стора */
  pageSize?: number;
  /** Подмена `fetch` — для тестов */
  fetchFn?: typeof fetch;
}

const toPageSize = (size: number) =>
  Math.min(Math.max(Math.trunc(size) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

export function createJobsStore(options: JobsStoreOptions = {}) {
  const baseUrl = (options.baseUrl ?? import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
  const fetchFn: typeof fetch = options.fetchFn ?? ((input, init) => globalThis.fetch(input, init));

  let jobs = $state<JobDto[][]>([]);
  let total = $state(0);
  let from = $state(0);
  let pageSize = $state(toPageSize(options.pageSize ?? DEFAULT_PAGE_SIZE));
  let loading = $state(false);
  let error = $state<string | null>(null);

  /** Номер текущей страницы, с единицы */
  const page = $derived(Math.floor(from / pageSize) + 1);
  /** Всего страниц; до первой загрузки — 1, чтобы переходы не улетали вперёд */
  const pageCount = $derived(Math.max(1, Math.ceil(total / pageSize)));
  const hasPrev = $derived(page > 1);
  const hasNext = $derived(page < pageCount);

  /** Номер последнего запроса: ответы устаревших запросов игнорируются */
  let requestId = 0;

  /** Зафиксировать ошибку запроса `id`, если он всё ещё актуален: список очищается */
  function setError(message: string, id: number): void {
    if (id !== requestId) {
      return;
    }

    jobs = [];
    total = 0;
    error = message;
  }

  /** Загрузить текущую страницу */
  async function load(): Promise<void> {
    const id = ++requestId;
    loading = true;
    error = null;

    try {
      const query = new URLSearchParams({ from: String(from), pageSize: String(pageSize) });
      const response = await fetchFn(`${baseUrl}/api/jobs?${query}`);

      if (!response.ok) {
        // Ошибка запроса — это состояние стора, а не исключение: `load()` не отклоняется
        setError(`GET /api/jobs → ${response.status} ${response.statusText}`.trim(), id);
        return;
      }

      const result: PageDto<JobDto[]> = await response.json();
      if (id !== requestId) {
        return;
      }

      jobs = result.pages;
      total = result.total;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause), id);
    } finally {
      if (id === requestId) {
        loading = false;
      }
    }
  }

  /** Перейти к странице `target` (с единицы); значение зажимается в допустимый диапазон */
  async function goToPage(target: number): Promise<void> {
    await setFrom((Math.min(Math.max(Math.trunc(target) || 1, 1), pageCount) - 1) * pageSize);
  }

  /** Установить смещение напрямую — так, как его понимает API */
  async function setFrom(offset: number): Promise<void> {
    const next = Math.max(0, Math.trunc(offset) || 0);
    if (next === from) {
      return;
    }

    from = next;
    await load();
  }

  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);

  /** Смена размера страницы возвращает на первую страницу */
  async function setPageSize(size: number): Promise<void> {
    pageSize = toPageSize(size);
    from = 0;
    await load();
  }

  return {
    /** Элементы текущей страницы */
    get jobs() {
      return jobs;
    },
    async restart(id: string) {
      const newId = (await fetchFn(`${baseUrl}/api/jobs/restart/${id}`, { method: 'PUT' })).text();
      await this.load();
      return newId;
    },
    async createSchedule(id: string) {
      const newId = (await fetchFn(`${baseUrl}/api/jobs/createSchedule/${id}`, { method: 'PUT' })).text();
      await this.load();
      return newId;
    },
    /** Размер всей выборки, не только текущей страницы */
    get total() {
      return total;
    },
    /** Текущее смещение (то, что уходит в `from`) */
    get from() {
      return from;
    },
    /** Текущий размер страницы (то, что уходит в `pageSize`) */
    get pageSize() {
      return pageSize;
    },
    get page() {
      return page;
    },
    get pageCount() {
      return pageCount;
    },
    get hasPrev() {
      return hasPrev;
    },
    get hasNext() {
      return hasNext;
    },
    get loading() {
      return loading;
    },
    /** Текст последней ошибки запроса или null */
    get error() {
      return error;
    },
    load,
    setFrom,
    goToPage,
    nextPage,
    prevPage,
    setPageSize
  };
}

/** Общий стор приложения */
export const jobsStore = createJobsStore();
