import { RESPONSE_SCHEMA } from './schema';
import { PROMPT_TEXT } from './prompt';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { geminiBalancer } from './balancer';
import type { HttpError } from './types';
import { NoAvailableModelError, ResponseError } from './types';

// todo: вынести в shared
const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
} as const;

const getRetryInfo = (error: { details: Array<{ '@type': string, retryDelay: string }> }) => {
  if (Array.isArray(error.details)) {
    const retryDelay = error.details.find((item) => item['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay;

    return retryDelay ? Number.parseInt(retryDelay) : undefined;
  }

  return undefined;
};

export const parseImage = async (fileName: string): Promise<string> => {
  const apiKey = process.env['GEMINI_API_KEY'];
  const proxyUrl = process.env['GEMINI_PROXY_URL'];
  const model = geminiBalancer.getAvailableModel();
  if (!model) {
    console.log('NoAvailableModelError');
    throw new NoAvailableModelError();
  }

  const url = `${proxyUrl}/v1beta/models/${model}:generateContent`;

  if (!apiKey) {
    throw new Error('No api key found.');
  }

  let buffer: Buffer;
  try {
    buffer = await readFile(fileName);
  } catch (err) {
    throw new Error(
      `Не удалось прочитать файл "${fileName}": ${(err as Error).message}`
    );
  }

  const ext = extname(fileName);
  const mimeType = MIME_BY_EXT[ext];
  if (!mimeType) {
    throw new Error(
      `Неподдерживаемый формат: ${ext}. Допустимо: ${Object.keys(MIME_BY_EXT).join(', ')}`
    );
  }

  const base64Data = buffer.toString('base64');
  const payload = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: base64Data } },
          { text: PROMPT_TEXT }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.1,
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingBudget: 0 }
    }
  };

  console.log('fetching starts!!');

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    if ((err as HttpError).code === 429) {
      geminiBalancer.update(model, '429', getRetryInfo(err as any));
    } else if ((err as HttpError).code === 503) {
      geminiBalancer.update(model, '503');
    } else {
      geminiBalancer.update(model, 'error');
    }
    throw new Error(
      `Сетевая ошибка при запросе к Gemini: ${(err as Error).message}`
    );
  }
  console.log('fetching is done!!');

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new ResponseError(
      `Gemini вернул HTTP ${response.status} ${response.statusText}: ${text}`, response
    );
  }

  const text = await response.text();

  // 5. Парсим ответ
  try {
    const json = JSON.parse(text);

    geminiBalancer.update(model, 'success');
    return json;
  } catch (err) {
    geminiBalancer.update(model, 'error');
    throw new ResponseError(
      `Gemini вернул невалидный JSON: ${(err as Error).message}`, response
    );
  }
};

export { geminiBalancer } from './balancer';
export { NoAvailableModelError } from './types';
