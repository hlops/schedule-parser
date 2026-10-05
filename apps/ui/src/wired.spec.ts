import { render, screen } from '@testing-library/svelte';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import App from './App.svelte';

/** Размер, который jsdom не умеет считать, но по нему wired рисует штрихи */
const ITEM_SIZE = { width: 120, height: 36 };

const realRect = Element.prototype.getBoundingClientRect;

const tabs = () => screen.getAllByRole('tab') as HTMLElement[];

beforeAll(() => {
	// wired рисует рамку по getBoundingClientRect хоста: без размеров
	// svg остаётся пустым и элемент не получает класс wired-rendered
	Element.prototype.getBoundingClientRect = () =>
		({ ...ITEM_SIZE, top: 0, left: 0, right: ITEM_SIZE.width, bottom: ITEM_SIZE.height, toJSON: () => ({}) }) as DOMRect;
});

afterAll(() => {
	Element.prototype.getBoundingClientRect = realRect;
});

describe('интеграция с wired-elements', () => {
	it('регистрирует кастомные элементы до рендера', () => {
		render(App);

		expect(customElements.get('wired-card')).toBeTypeOf('function');
		expect(customElements.get('wired-divider')).toBeTypeOf('function');
		expect(customElements.get('wired-item')).toBeTypeOf('function');
	});

	it('передаёт selected свойством, а не атрибутом', async () => {
		render(App);
		// маршрут резолвится асинхронно (корень `/` редиректит на вкладку
		// по умолчанию), поэтому дожидаемся, пока появится активный таб
		await screen.findByRole('tab', { selected: true });
		const all = tabs();

		// независимо от того, какой таб открыт по умолчанию
		expect(all.filter((tab) => tab.selected)).toHaveLength(1);
		expect(all.filter((tab) => tab.hasAttribute('selected'))).toHaveLength(0);
	});

	it('рисует штриховую рамку в shadow DOM', async () => {
		render(App);
		await new Promise((resolve) => setTimeout(resolve));

		const svg = tabs()[0].shadowRoot?.querySelector('svg');

		// без класса элемент остаётся с opacity: 0, то есть невидимым
		expect(tabs()[0].classList.contains('wired-rendered')).toBe(true);
		expect(svg?.getAttribute('width')).toBe(String(ITEM_SIZE.width));
		expect(svg?.querySelectorAll('path').length).toBeGreaterThan(0);
	});
});
