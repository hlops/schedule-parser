import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import App from './App.svelte';
import { DEFAULT_TAB, TABS } from './lib/tabs';

const tabLabels = () =>
	screen.getAllByRole('tab').map((tab) => tab.textContent?.trim());

describe('App', () => {
	it('рендерит три таба: дашборд, джобы, логи', () => {
		render(App);

		expect(tabLabels()).toEqual(['Дашборд', 'Джобы', 'Логи']);
	});

	// Ожидание берём из DEFAULT_TAB: таб по умолчанию меняют довольно часто,
	// и тест должен проверять связку «выбран его таб + открыта его панель»
	it('по умолчанию открывает вкладку из DEFAULT_TAB', () => {
		render(App);
		const { label } = TABS.find((tab) => tab.id === DEFAULT_TAB);

		expect(screen.getByRole('tab', { name: label }).getAttribute('aria-selected')).toBe('true');
		expect(screen.getByRole('tabpanel').textContent).toContain(label);
	});

	it('переключает панель по клику на таб', async () => {
		render(App);

		await fireEvent.click(screen.getByRole('tab', { name: 'Джобы' }));
		expect(screen.getByRole('tabpanel').textContent).toContain('Джобы');

		await fireEvent.click(screen.getByRole('tab', { name: 'Логи' }));
		expect(screen.getByRole('tabpanel').textContent).toContain('Логи');
	});
});
