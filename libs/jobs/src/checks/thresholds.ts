import { CheckJob } from '@schedule-parser/shared';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const checkThresholds = (metrics: CheckJob['metrics']) => {
  if (!metrics) {
    throw new Error('Metrics not found');
  }

  let score = 0;

// --- Сильные признаки документа ---
  if (metrics.whiteRatio > 0.35) score += 0.30;
  else if (metrics.whiteRatio > 0.20) score += 0.15;

  if (metrics.colorDiversity < 0.08) score += 0.30;

  // --- Средние признаки ---
  if (metrics.avgSaturation < 0.15) score += 0.20;

  if (metrics.grayscale > 0.85) score += 0.10;
  if (metrics.avgLuminance > 200) score += 0.10;

  // --- Энтропия (главный дискриминатор фото/документ) ---
  if (metrics.entropy < 5.5) score += 0.15;
  else if (metrics.entropy > 7.0) score -= 0.25;

  // --- Размеры ---
  if (metrics.width < 400 || metrics.height < 400) score -= 0.50;
  if (metrics.width >= 800 && metrics.width <= 3000) score += 0.10;
  if (metrics.width > 4000 || metrics.height > 4000) score -= 0.15;

  // --- Аспект (расширен под широкие таблицы) ---
  const aspectRatio = metrics.width / metrics.height;
  if (aspectRatio >= 1.2 && aspectRatio <= 3.5) score += 0.10;
  else if (aspectRatio > 5.0 || aspectRatio < 0.4) score -= 0.30;

  // --- Анти-признаки ---
  if (metrics.avgSaturation > 0.40) score -= 0.20;
  if (metrics.colorDiversity > 0.40) score -= 0.20;

  score = clamp(score, 0, 1);

  if (clamp(score, 0, 1) < 0.70) {
    throw new Error(`Threshold was not met: ${score.toFixed(2)}`);
  }

};
