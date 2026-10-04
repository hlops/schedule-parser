export type ParseResult = 'success' | 'error' | 'skip' | '503' | '429';

export class NoAvailableModelError extends Error {
  override name = 'NoAvailableModelError';

  constructor() {
    super('No model available.');
  }
}

export class ResponseError extends Error {
  constructor(message: string, public readonly response: Response) {
    super(message);
  }
}

export interface HttpError extends Error {
  code: number;
}
