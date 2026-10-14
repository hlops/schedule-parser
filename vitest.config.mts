import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      '**/vite.config.{mjs,js,ts,mts}',
      '**/vitest.config.{mjs,js,ts,mts}',
      '!vitest.config.{mjs,js,ts,mts}',
      '!vite.config.{mjs,js,ts,mts}',
      // tmp/ — gitignored черновик с бэкапами nx-генераторов (dto~, schema~, ...),
      // их конфиги объявляют те же имена проектов и ломают сборку workspace
      '!tmp/**'
    ],
  },
});
