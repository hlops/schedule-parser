import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import App from './App.svelte';

const tabLabels = () =>
	screen.getAllByRole('tab').map((tab) => tab.textContent?.trim());

describe('App', () => {
	it('рендерит три таба: дашборд, джобы, логи', () => {
		render(App);

		expect(tabLabels()).toEqual(['Дашборд', 'Джобы', 'Логи']);
	});

	it('по умолчанию открывает дашборд', () => {
		render(App);

		expect(screen.getByRole('tab', { name: 'Дашборд' }).getAttribute('aria-selected')).toBe('true');
		expect(screen.getByRole('tabpanel').textContent).toContain('Дашборд');
	});

	it('переключает панель по клику на таб', async () => {
		render(App);

		await fireEvent.click(screen.getByRole('tab', { name: 'Джобы' }));
		expect(screen.getByRole('tabpanel').textContent).toContain('Джобы');

		await fireEvent.click(screen.getByRole('tab', { name: 'Логи' }));
		expect(screen.getByRole('tabpanel').textContent).toContain('Логи');
	});
});
