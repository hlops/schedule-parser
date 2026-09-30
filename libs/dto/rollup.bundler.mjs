import { dts } from 'rollup-plugin-dts';

export default {
  input: 'dist/libs/dto/index.d.ts', // Точка входа — сгенерированный Vite индексный .d.ts
  output: {
    file: '.tmp/dto-bundle.d.ts',    // Куда сохранить склеенный файл
    format: 'es',
  },
  plugins: [dts()],
};
