import { describe, expect, it } from 'vitest';
import type { JobDto, PageDto } from '@schedule-parser/dto';
import { createJobsStore, DEFAULT_PAGE_SIZE } from './jobs.svelte';

const job = (fileName: string): JobDto => ({
	fileName,
	type: 'check',
	status: 'done',
	iteration: 1,
	startAt: 0
});

const body = (jobs: JobDto[], total: number): PageDto<JobDto> => ({ pages: jobs, total });

const ok = (data: PageDto<JobDto>) =>
	({ ok: true, status: 200, statusText: 'OK', json: async () => data }) as Response;

const failure = (status: number, statusText: string) =>
	({ ok: false, status, statusText, json: async () => ({}) }) as Response;

/** Заглушка fetch: пишет запрошенные URL и отдаёт ответы по очереди */
const stubFetch = (...responses: Array<Response | (() => Promise<Response>)>) => {
	const urls: string[] = [];
	const fetchFn = (async (input: string | URL | Request) => {
		urls.push(String(input));

		const next = responses.shift();
		if (!next) {
			throw new Error('неожиданный запрос');
		}

		return typeof next === 'function' ? next() : next;
	}) as typeof fetch;

	return { urls, fetchFn };
};

/** Ответ, который тест отдаёт сам — чтобы управлять порядком ответов */
const deferred = () => {
	let resolve!: (value: Response) => void;
	const promise = new Promise<Response>((done) => (resolve = done));
	return { promise, resolve };
};

describe('jobsStore', () => {
	it('загружает первую страницу с параметрами по умолчанию', async () => {
		const { urls, fetchFn } = stubFetch(ok(body([job('a'), job('b')], 42)));
		const store = createJobsStore({ fetchFn });

		await store.load();

		expect(urls).toEqual([`/api/jobs?from=0&pageSize=${DEFAULT_PAGE_SIZE}`]);
		expect(store.jobs.map((item) => item.fileName)).toEqual(['a', 'b']);
		expect(store.total).toBe(42);
		expect(store.loading).toBe(false);
		expect(store.error).toBeNull();
	});

	it('добавляет baseUrl к запросу', async () => {
		const { urls, fetchFn } = stubFetch(ok(body([], 0)));
		const store = createJobsStore({ baseUrl: 'http://api.test/', fetchFn });

		await store.load();

		expect(urls).toEqual([`http://api.test/api/jobs?from=0&pageSize=${DEFAULT_PAGE_SIZE}`]);
	});

	it('nextPage и prevPage сдвигают смещение на размер страницы', async () => {
		const { urls, fetchFn } = stubFetch(
			ok(body([job('a')], 45)),
			ok(body([job('b')], 45)),
			ok(body([job('c')], 45))
		);
		const store = createJobsStore({ fetchFn });
		await store.load();

		await store.nextPage();

		expect(urls[1]).toBe('/api/jobs?from=20&pageSize=20');
		expect(store.page).toBe(2);
		expect(store.pageCount).toBe(3);
		expect(store.hasPrev).toBe(true);
		expect(store.hasNext).toBe(true);
		expect(store.jobs.map((item) => item.fileName)).toEqual(['b']);

		await store.prevPage();

		expect(urls[2]).toBe('/api/jobs?from=0&pageSize=20');
		expect(store.page).toBe(1);
	});

	it('за границы страниц не выходит и лишних запросов не делает', async () => {
		const { urls, fetchFn } = stubFetch(ok(body([job('a')], 45)), ok(body([job('c')], 45)));
		const store = createJobsStore({ fetchFn });
		await store.load();

		await store.prevPage(); // уже первая страница
		await store.goToPage(99); // дальше последней

		expect(urls).toEqual(['/api/jobs?from=0&pageSize=20', '/api/jobs?from=40&pageSize=20']);
		expect(store.page).toBe(3);
		expect(store.pageCount).toBe(3);
		expect(store.hasNext).toBe(false);
	});

	it('при пустой выборке остаётся одна страница', async () => {
		const { fetchFn } = stubFetch(ok(body([], 0)));
		const store = createJobsStore({ fetchFn });

		await store.load();

		expect(store.jobs).toEqual([]);
		expect(store.pageCount).toBe(1);
		expect(store.hasNext).toBe(false);
	});

	it('смена размера страницы возвращает на первую страницу и зажимает значение', async () => {
		const { urls, fetchFn } = stubFetch(
			ok(body([job('a')], 45)),
			ok(body([job('b')], 45)),
			ok(body([job('c')], 45)),
			ok(body([job('d')], 45))
		);
		const store = createJobsStore({ fetchFn });
		await store.load();
		await store.nextPage(); // from = 20

		await store.setPageSize(500);

		expect(store.pageSize).toBe(200);
		expect(store.from).toBe(0);
		expect(urls[2]).toBe('/api/jobs?from=0&pageSize=200');

		await store.setPageSize(0); // мусор → дефолт

		expect(store.pageSize).toBe(DEFAULT_PAGE_SIZE);
	});

	it('ошибка HTTP попадает в error, список очищается', async () => {
		const { fetchFn } = stubFetch(
			ok(body([job('a')], 45)),
			failure(500, 'Internal Server Error')
		);
		const store = createJobsStore({ fetchFn });
		await store.load();
		expect(store.jobs).toHaveLength(1);

		await store.nextPage();

		expect(store.error).toBe('GET /api/jobs → 500 Internal Server Error');
		expect(store.jobs).toEqual([]);
		expect(store.total).toBe(0);
		expect(store.loading).toBe(false);
	});

	it('сетевая ошибка не роняет стор', async () => {
		const { fetchFn } = stubFetch(() => Promise.reject(new Error('Failed to fetch')));
		const store = createJobsStore({ fetchFn });

		await store.load();

		expect(store.error).toBe('Failed to fetch');
		expect(store.jobs).toEqual([]);
		expect(store.total).toBe(0);
		expect(store.loading).toBe(false);
	});

	it('ответ устаревшего запроса не перетирает актуальный', async () => {
		const stale = deferred();
		const actual = deferred();
		const { fetchFn } = stubFetch(
			() => stale.promise,
			() => actual.promise
		);
		const store = createJobsStore({ fetchFn });

		const first = store.load(); // from = 0
		const second = store.setFrom(20); // уходит вторым, отвечает первым

		actual.resolve(ok(body([job('actual')], 45)));
		await second;

		stale.resolve(ok(body([job('stale')], 1)));
		await first;

		expect(store.jobs.map((item) => item.fileName)).toEqual(['actual']);
		expect(store.total).toBe(45);
		expect(store.loading).toBe(false);
		expect(store.error).toBeNull();
	});
});
