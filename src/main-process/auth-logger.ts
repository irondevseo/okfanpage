import { isAxiosError } from 'axios';

const PREFIX = '[okfanpage:auth]';

export function logAuthPhase(
  phase: string,
  data: Record<string, unknown>,
): void {
  const line = `${PREFIX} ${phase} ${JSON.stringify(data)}`;
  // console.error(line);
}

/** Rút gọn body để log (không log cookie người dùng). */
export function previewText(body: string, maxLen = 700): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  if (flat.length <= maxLen) {
    return flat;
  }
  return `${flat.slice(0, maxLen)}… [${flat.length} ký tự]`;
}

export function logAuthAxiosError(phase: string, err: unknown): void {
  if (!isAxiosError(err)) {
    logAuthPhase(phase, {
      type: 'non-axios',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return;
  }
  const res = err.response;
  const data = res?.data;
  const bodyStr =
    typeof data === 'string'
      ? data
      : data !== undefined
        ? JSON.stringify(data)
        : undefined;
  logAuthPhase(phase, {
    message: err.message,
    code: err.code,
    status: res?.status,
    statusText: res?.statusText,
    contentType: res?.headers && res.headers['content-type'],
    bodyPreview: bodyStr ? previewText(bodyStr) : undefined,
  });
}
