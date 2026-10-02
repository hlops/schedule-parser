import { join } from 'node:path';
import { CheckJob, UPLOADS_DIR } from '@schedule-parser/shared';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

// Диагностика нативной части sharp: одна строка в лог на процесс,
// чтобы сразу видеть, какой libvips подхватился
let vipsVersionLogged = false;
const logVipsVersion = () => {
  if (vipsVersionLogged) return;
  vipsVersionLogged = true;
  console.log(`[sharp] libvips ${sharp.versions.vips} (${process.platform}/${process.arch})`);
};

export const analyzeImage = async (fileName: string): Promise<CheckJob['metrics']> => {
  logVipsVersion();

  const filePath = join(UPLOADS_DIR, fileName);

  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const metadata = await sharp(filePath, { failOn: 'none' }).metadata();
  const width = metadata.width;
  const height = metadata.height;

  if (!width || !height) {
    throw new Error(`Не удалось определить размеры изображения: ${filePath}`);
  }

  // 2. Ресайз до 200x200 для быстрого анализа пикселей
  //    (нам не нужна детализация, только статистика)
  const { data, info } = await sharp(filePath)
    .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
    .removeAlpha()          // убираем альфа-канал для честной статистики
    .raw()                  // возвращаем сырой Buffer, а не PNG
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels; // 3 (RGB) или 1 (Grayscale)
  const totalPixels = info.width * info.height;

  // 3. Собираем статистику
  let whitePixels = 0;
  let grayscalePixels = 0;
  let totalSaturation = 0;
  let totalLuminance = 0;
  const colorSet = new Set<number>();
  const histogram = new Uint32Array(256);

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = channels >= 3 ? data[i + 1] : r;
    const b = channels >= 3 ? data[i + 2] : r;

    // Белый фон
    if (r > 230 && g > 230 && b > 230) whitePixels++;

    // Grayscale-подобие
    if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10) grayscalePixels++;

    // Насыщенность (HSV Saturation)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    totalSaturation += max === 0 ? 0 : (max - min) / max;

    // Яркость
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLuminance += luminance;
    histogram[Math.round(luminance)]++;

    // Уникальные цвета (квантование до 5 бит на канал = 32768 возможных)
    const quantR = r >> 3;
    const quantG = g >> 3;
    const quantB = b >> 3;
    colorSet.add((quantR << 10) | (quantG << 5) | quantB);
  }

  // Энтропия Шеннона по гистограмме яркости
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    const h = histogram[i];
    if (h === 0) continue;
    const p = h / totalPixels;
    entropy -= p * Math.log2(p);
  }

  return {
    width,
    height,
    avgSaturation: totalSaturation / totalPixels,
    avgLuminance: totalLuminance / totalPixels,
    whiteRatio: whitePixels / totalPixels,
    colorDiversity: colorSet.size / totalPixels,
    grayscale: grayscalePixels / totalPixels,
    entropy
  };
};
