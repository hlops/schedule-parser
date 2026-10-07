export interface GeminiInlineData {
  mimeType: string;
  data: string;
}

export interface GeminiFileData {
  mimeType: string;
  fileUri: string;
}

export interface GeminiFunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface GeminiFunctionResponse {
  name: string;
  response: Record<string, unknown>;
}

export interface GeminiPart {
  text?: string;
  inlineData?: GeminiInlineData;
  fileData?: GeminiFileData;
  functionCall?: GeminiFunctionCall;
  functionResponse?: GeminiFunctionResponse;
  thoughtSignature?: string;
}

// ====== Контент ======

export interface GeminiContent {
  parts: GeminiPart[];
  role: 'user' | 'model' | string;
}

// ====== Кандидат ======

export type GeminiFinishReason =
  | 'FINISH_REASON_UNSPECIFIED'
  | 'STOP'
  | 'MAX_TOKENS'
  | 'SAFETY'
  | 'RECITATION'
  | 'LANGUAGE'
  | 'OTHER'
  | 'BLOCKLIST'
  | 'PROHIBITED_CONTENT'
  | 'SPII'
  | 'MALFORMED_FUNCTION_CALL'
  | 'IMAGE_SAFETY';

export interface GeminiSafetyRating {
  category: string;
  probability: string;
  blocked?: boolean;
}

export interface GeminiCitationMetadata {
  citationSources: Array<{
    startIndex?: number;
    endIndex?: number;
    uri?: string;
    license?: string;
  }>;
}

export interface GeminiCandidate {
  content: GeminiContent;
  finishReason?: GeminiFinishReason;
  index?: number;
  safetyRatings?: GeminiSafetyRating[];
  citationMetadata?: GeminiCitationMetadata;
  tokenCount?: number;
}

// ====== Usage metadata ======

export interface GeminiModalityTokenCount {
  modality: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | string;
  tokenCount: number;
}

export interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
  thoughtsTokenCount?: number;
  cachedContentTokenCount?: number;
  promptTokensDetails?: GeminiModalityTokenCount[];
  candidatesTokensDetails?: GeminiModalityTokenCount[];
  serviceTier?: 'standard' | 'flex' | 'priority' | string;
}

// ====== Промпт-фидбек ======

export interface GeminiPromptFeedback {
  blockReason?: string;
  safetyRatings?: GeminiSafetyRating[];
  blockReasonMessage?: string;
}

// ====== Ошибка API ======

export interface GeminiErrorDetail {
  '@type': string;
  [key: string]: unknown;
}

export interface GeminiError {
  code: number;
  message: string;
  status: string;
  details?: GeminiErrorDetail[];
}

// ====== Корневой ответ ======

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
  usageMetadata?: GeminiUsageMetadata;
  modelVersion?: string;
  responseId?: string;
  promptFeedback?: GeminiPromptFeedback;
  error?: GeminiError;
}
