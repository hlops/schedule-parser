/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import tailwindcss from '@tailwindcss/vite';

/** Бэкенд для прокси `/api`: `nx serve api` слушает 3000, CORS на стороне Fastify не настроен */
const apiProxy = {
  '/api': {
    target: process.env.API_URL ?? 'http://localhost:3000',
    changeOrigin: true
  },
  '/upload': {
    target: process.env.API_URL ?? 'http://localhost:3000',
    changeOrigin: true
  }
};

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/ui',
  server: {
    port: 4200,
    host: 'localhost',
    proxy: apiProxy
  },
  preview: {
    port: 4300,
    host: 'localhost',
    proxy: apiProxy
  },
  plugins: [tailwindcss(), svelte(), svelteTesting()],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/ui',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  test: {
    name: 'ui',
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/ui',
      provider: 'v8' as const
    },
    // sv-router поставляет .svelte-компонент (Router.svelte). Без инлайна
    // Vitest внешнит пакет из node_modules и не скомпилирует Svelte-файл.
    server: {
      deps: {
        inline: ['sv-router']
      }
    }
  }
}));
