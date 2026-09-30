/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/dto',
  resolve: {
    tsconfigPaths: true
  },
  plugins: [
    dts({
      // bundle
      rollupTypes: true,
      entryRoot: 'src',
      tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'),
      pathsToAliases: false,
      rollupOptions: {
        messageCallback: (message) => {
          if (
            message.messageId === 'console-preamble' ||
            message.messageId === 'console-compiler-version-notice'
          ) {
            message.handled = true;
          }
        }
      }
    })
  ],
  build: {
    outDir: '../../dist/libs/dto',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'dto',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es' as const]
    },
    rolldownOptions: {
      // External packages that should not be bundled into your library.
      external: []
    }
  },
}));
