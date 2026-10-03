/**
 * Типы кастомных элементов для svelte-check и редактора.
 * Без них Svelte не знает про <wired-*> и <mwc-icon> и подсвечивает их
 * как неизвестные теги.
 * Свойства описаны по docs/ в пакете wired-elements.
 */
import type { SvelteHTMLElements } from 'svelte/elements';

type BaseElement = SvelteHTMLElements['div'];

type WithElevation = {
  elevation?: number;
}

declare module 'svelte/elements' {
	export interface SvelteHTMLElements {
		'wired-card': BaseElement & WithElevation & {
			fill?: string;
		};
		'wired-divider': BaseElement & WithElevation;
		'wired-item': BaseElement & {
			name?: string;
			selected?: boolean;
			value?: string;
		};
    'wired-icon-button': BaseElement & WithElevation;
    'wired-image': BaseElement & WithElevation;
    'wired-button': BaseElement & WithElevation;
		'mwc-icon': BaseElement;
	}
}
