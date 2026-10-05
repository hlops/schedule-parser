import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App.svelte';
import { DEFAULT_TAB, TABS } from './lib/tabs';

const tabLabels = () =>
	screen.getAllByRole('tab').map((tab) => tab.textContent?.trim());

/** Текст активной панели — по нему проверяем, какой маршрут отрисован */
const panelText = () => screen.getByRole('tabpanel').textContent ?? '';

const tabByName = (name: string, selected?: boolean) =>
	screen.getByRole('tab', { name, selected });

/**
 * Роутер резолвит маршрут асинхронно: таб подсвечивается раньше, чем панель
 * успевает отрисоваться, поэтому ждём и активный таб, и содержимое панели.
 */
const expectRoute = async (label: string, pathname: string) => {
	await screen.findByRole('tab', { name: label, selected: true });
	await waitFor(() => expect(panelText()).toContain(label));
	expect(window.location.pathname).toBe(pathname);
};

describe('App', () => {
	// URL — источник истины для активной вкладки, поэтому каждый тест начинается с корня
	beforeEach(() => {
		window.history.replaceState(null, '', '/');
	});

	it('рендерит три таба: дашборд, джобы, логи', () => {
		render(App);

		expect(tabLabels()).toEqual(['Дашборд', 'Джобы', 'Логи']);
	});

	// Ожидание берём из DEFAULT_TAB: таб по умолчанию меняют довольно часто,
	// и тест должен проверять связку «корень ведёт на его URL + открыта его панель»
	it('корень редиректит на вкладку из DEFAULT_TAB', async () => {
		render(App);
		const { label } = TABS.find((tab) => tab.id === DEFAULT_TAB);

		await expectRoute(label, '/jobs');
	});

	it('переключает маршрут и панель по клику на таб', async () => {
		render(App);
		await screen.findByRole('tab', { name: 'Джобы', selected: true });

		await fireEvent.click(tabByName('Логи'));
		await expectRoute('Логи', '/logs');

		await fireEvent.click(tabByName('Дашборд'));
		await expectRoute('Дашборд', '/dashboard');
	});

	it('открывает вкладку по прямому адресу', async () => {
		window.history.replaceState(null, '', '/logs');
		render(App);

		await expectRoute('Логи', '/logs');
	});

	it('показывает заглушку для неизвестного адреса', async () => {
		window.history.replaceState(null, '', '/unknown');
		render(App);

		await screen.findByText('Страница не найдена');
		expect(panelText()).toContain('Страница не найдена');
	});
});
