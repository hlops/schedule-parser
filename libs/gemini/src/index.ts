import { RESPONSE_SCHEMA } from './schema';
import { PROMPT_TEXT } from './prompt';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';


const GEMINI_MODEL = 'gemini-3.8-flash' as const;

// todo: вынести в shared
const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
} as const;

export const parseImage = async (fileName: string): Promise<string> => {
  const apiKey = process.env['GEMINI_API_KEY'];
  const proxyUrl = process.env['GEMINI_PROXY_URL'];
  const url = `${proxyUrl}/v1beta/models/${GEMINI_MODEL}:generateContent`;

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
    throw new Error(
      `Сетевая ошибка при запросе к Gemini: ${(err as Error).message}`
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `Gemini вернул HTTP ${response.status} ${response.statusText}: ${text}`
    );
  }

  const text = await response.text();

  // 5. Парсим ответ
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error(err);
    console.error(text);
    console.error(response);
    throw new Error(
      `Gemini вернул невалидный JSON: ${(err as Error).message}`
    );
  }
};
