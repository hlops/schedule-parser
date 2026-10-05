/**
 * Табы приложения — единый источник списка, меток и путей.
 *
 * `path` каждого таба совпадает с ключом маршрута в `router.ts`:
 * именно по URL определяется активная вкладка.
 */
export const TABS = [
  { id: 'dashboard', label: 'Дашборд', path: '/dashboard' },
  { id: 'jobs', label: 'Джобы', path: '/jobs' },
  { id: 'logs', label: 'Логи', path: '/logs' }
] as const;

export type TabId = (typeof TABS)[number]['id'];
export type TabPath = (typeof TABS)[number]['path'];

/** Вкладка по умолчанию — на её путь редиректит корень `/` (см. `router.ts`) */
export const DEFAULT_TAB: TabId = 'jobs';
