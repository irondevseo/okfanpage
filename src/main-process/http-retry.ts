import { isAxiosError } from 'axios';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Lỗi tạm thời / rate limit — `withRetry` sẽ backoff và thử lại. */
export class TransientRequestError extends Error {
  readonly retryAfterMs?: number;
  readonly httpStatus?: number;

  constructor(
    message: string,
    opts?: { retryAfterMs?: number; httpStatus?: number },
  ) {
    super(message);
    this.name = 'TransientRequestError';
    this.retryAfterMs = opts?.retryAfterMs;
    this.httpStatus = opts?.httpStatus;
  }
}

export function isRetryableHttpStatus(status: number | undefined): boolean {
  return (
    status === 429 ||
    status === 408 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

export function getRetryAfterMsFromAxiosError(err: unknown): number | undefined {
  if (!isAxiosError(err)) {
    return undefined;
  }
  const raw = err.response?.headers?.['retry-after'];
  if (raw == null) {
    return undefined;
  }
  const s = String(raw).trim();
  const sec = Number(s);
  if (Number.isFinite(sec) && sec > 0) {
    return sec * 1000;
  }
  const until = Date.parse(s);
  if (!Number.isNaN(until)) {
    return Math.max(0, until - Date.now());
  }
  return undefined;
}

export function isRetryableAxiosError(err: unknown): boolean {
  if (!(err instanceof Error)) {
    return false;
  }
  if (err instanceof TransientRequestError) {
    return true;
  }
  if (!isAxiosError(err)) {
    return false;
  }
  const code = err.code;
  if (
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN'
  ) {
    return true;
  }
  if (!err.response) {
    return true;
  }
  return isRetryableHttpStatus(err.response.status);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    isRetryable: (err: unknown) => boolean;
    getRetryAfterMs?: (err: unknown) => number | undefined;
  },
): Promise<T> {
  let lastErr: unknown;
  const max = Math.max(1, options.maxAttempts);

  for (let attempt = 1; attempt <= max; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const retryable = options.isRetryable(e);
      if (!retryable || attempt >= max) {
        throw e;
      }
      let delay = options.baseDelayMs * 2 ** (attempt - 1);
      const fromErr =
        e instanceof TransientRequestError && e.retryAfterMs != null
          ? e.retryAfterMs
          : options.getRetryAfterMs?.(e);
      if (fromErr != null && fromErr > 0) {
        delay = Math.max(delay, fromErr);
      }
      delay = Math.min(delay, options.maxDelayMs);
      delay += Math.random() * 400;
      await sleep(delay);
    }
  }
  throw lastErr;
}
