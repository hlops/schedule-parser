export interface HttpError extends Error {
  code: number;
}

export interface RetryDelayError extends HttpError {
  details: Array<{ '@type': string, retryDelay: string }>;
}
