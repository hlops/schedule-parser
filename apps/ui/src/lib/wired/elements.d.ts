/**
 * Типы кастомных элементов для svelte-check и редактора.
 * Без них Svelte не знает про <wired-*> и подсвечивает их как неизвестные теги.
 * Свойства описаны по docs/ в пакете wired-elements.
 */
import type { SvelteHTMLElements } from 'svelte/elements';

type BaseElement = SvelteHTMLElements['div'];

declare module 'svelte/elements' {
	export interface SvelteHTMLElements {
		'wired-card': BaseElement & {
			elevation?: number;
			fill?: string;
		};
		'wired-divider': BaseElement & {
			elevation?: number;
		};
		'wired-item': BaseElement & {
			name?: string;
			selected?: boolean;
			value?: string;
		};
	}
}
