/** Табы приложения — единый источник списка и меток */
export const TABS = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'jobs', label: 'Джобы' },
  { id: 'logs', label: 'Логи' }
];

export type TabId = (typeof TABS)[number]['id'];

export const DEFAULT_TAB: TabId = 'jobs';
