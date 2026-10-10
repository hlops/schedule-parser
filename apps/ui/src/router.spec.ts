import { describe, expect, it } from 'vitest';
import { p } from './router';
import { TABS } from './tabs';

describe('router', () => {
	it('строит путь маршрута', () => {
		expect(p('/logs')).toBe('/logs');
	});

	it('добавляет search-параметры к пути', () => {
		expect(p('/job', { search: { id: 'job-1' } })).toBe('/job?id=job-1');
	});

	it('пути вкладок совпадают с путями маршрутов', () => {
		for (const tab of TABS) {
			expect(p(tab.path)).toBe(tab.path);
		}
	});
});
