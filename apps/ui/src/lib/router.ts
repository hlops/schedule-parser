import { createRouter } from 'sv-router';
import DashboardView from './views/DashboardView.svelte';
import JobView from './views/JobView.svelte';
import JobsView from './views/JobsView.svelte';
import LogsView from './views/LogsView.svelte';
import NotFoundView from './views/NotFoundView.svelte';

/**
 * Единственная точка объявления маршрутов приложения.
 *
 * `createRouter` возвращает API навигации:
 * - `p(path, options)` — собрать URL (подставляет параметры и search-строку);
 * - `navigate(path, options)` — перейти программно;
 * - `route` — текущее состояние URL (`pathname`, `search`, `hash`, `params`).
 *
 * Значения ключей должны совпадать с `path` вкладок из `tabs.ts`.
 */
export const { p, navigate, route } = createRouter({
  // Верхнеуровневый beforeLoad срабатывает для любого совпадения,
  // поэтому корень `/` переводим на вкладку по умолчанию (DEFAULT_TAB = 'jobs').
  // `replace` — чтобы в истории не оседал лишний переход с `/`.
  hooks: {
    beforeLoad({ pathname }) {
      if (pathname === '/') {
        throw navigate('/jobs', { replace: true });
      }
    }
  },
  '/dashboard': DashboardView,
  '/jobs': JobsView,
  '/job': JobView,
  '/logs': LogsView,
  // Заглушка для всех остальных адресов
  '*': NotFoundView
});
