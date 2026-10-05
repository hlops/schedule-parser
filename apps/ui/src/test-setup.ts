/**
 * Заглушки для API, которых нет в jsdom.
 *
 * `sv-router` при инициализации роутера создаёт `IntersectionObserver`
 * (preload ссылок при появлении во вьюпорте), а при навигации зовёт
 * `window.scrollTo`. В jsdom их нет — без заглушек импорт роутера падает.
 */

/* eslint-disable @typescript-eslint/no-empty-function -- методы-заглушки намеренно ничего не делают */

class IntersectionObserverStub implements IntersectionObserver {
  scrollMargin: string;
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];

  observe(): void {
  }

  unobserve(): void {
  }

  disconnect(): void {
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (!('IntersectionObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverStub
  });
}

window.scrollTo = () => {
};
