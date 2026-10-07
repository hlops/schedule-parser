import { PROMPT_TEXT } from './prompt';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Model } from './balancer';
import { GeminiResponse } from './response-type';
import { ParsedScheduleSchema } from '@schedule-parser/dto';
import { Value } from '@sinclair/typebox/value';
import { ParseJob, UPLOADS_DIR } from '@schedule-parser/shared';
import { Static } from '@sinclair/typebox';

// todo: вынести в shared
const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
} as const;

export const parseImage = async (job: ParseJob, model: Model): Promise<Static<typeof ParsedScheduleSchema>> => {
  const filePath = join(UPLOADS_DIR, job.fileName);

  const apiKey = process.env['GEMINI_API_KEY'];
  const proxyUrl = process.env['GEMINI_PROXY_URL'];

  const url = `${proxyUrl}/v1beta/models/${model}:generateContent`;

  if (!apiKey) {
    throw new Error('No api key found.');
  }

  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch (err) {
    throw new Error(
      `Не удалось прочитать файл "${filePath}": ${(err as Error).message}`
    );
  }

  const ext = extname(filePath);
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
      responseJsonSchema: ParsedScheduleSchema,
      temperature: 0.1,
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingBudget: 0 }
    }
  };

  const response: Response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  job.response = text;

  if (!response.ok) {
    throw new Error(
      `Gemini вернул HTTP ${response.status} ${response.statusText}: ${text}`
    );
  }

  let json: GeminiResponse;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Gemini вернул невалидный JSON: ${(err as Error).message}`
    );
  }

  if (json.candidates?.length !== 1) {
    throw new Error(
      `Gemini вернул неожиданное кол-во candidates`
    );
  }

  if (json.candidates[0].finishReason !== 'STOP') {
    throw new Error(
      `Gemini вернул невалидный finishReason`
    );
  }

  if (json.candidates[0].content.parts.length !== 1) {
    throw new Error(
      `Gemini вернул неожиданное кол-во parts`
    );
  }

  if (!json.candidates[0].content.parts[0].text) {
    throw new Error(
      `Gemini вернул невалидный finishReason`
    );
  }

  let schedulerJson;
  try {
    schedulerJson = JSON.parse(json.candidates[0].content.parts[0].text);
  } catch {
    throw new Error(
      `Gemini вернул невалидный json для расписания`
    );
  }

  if (!Value.Check(ParsedScheduleSchema, schedulerJson)) {
    throw new Error(
      `Gemini вернул невалидное расписание`
    );
  }

  return JSON.parse(json.candidates[0].content.parts[0].text);
};

export { geminiBalancer } from './balancer';
export * from './types';
