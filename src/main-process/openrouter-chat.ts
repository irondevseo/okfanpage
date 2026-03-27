import axios from 'axios';
import { getContentPromptText, getOpenRouterSecrets } from './settings-store';
import {
  getRetryAfterMsFromAxiosError,
  isRetryableAxiosError,
  isRetryableHttpStatus,
  TransientRequestError,
  withRetry,
} from './http-retry';
import {
  REUP_HTTP_MAX_ATTEMPTS,
  REUP_HTTP_RETRY_BASE_MS,
  REUP_HTTP_RETRY_MAX_MS,
} from './reup-batch-config';

type ChatMessage = { role: 'system' | 'user'; content: string };

export type RewriteCaptionConfig = {
  apiKey: string;
  model: string;
  instruction: string;
};

export function getRewriteCaptionConfigOrThrow(): RewriteCaptionConfig {
  const secrets = getOpenRouterSecrets();
  const instruction = getContentPromptText()?.trim() ?? '';
  if (!secrets?.apiKey) {
    throw new Error('Chưa cấu hình OpenRouter (API key) trong Cài đặt.');
  }
  if (!instruction) {
    throw new Error('Chưa cấu hình prompt nội dung trong Cài đặt.');
  }
  return {
    apiKey: secrets.apiKey,
    model: secrets.modelId,
    instruction,
  };
}

export async function rewriteCaptionWithConfig(
  cfg: RewriteCaptionConfig,
  original: string,
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: cfg.instruction },
    {
      role: 'user',
      content:
        `Nội dung mô tả gốc của video (có thể rỗng):\n---\n${original || '(không có)'}\n---\nTrả về chỉ một đoạn mô tả mới phù hợp đăng Facebook, không giải thích thêm.`,
    },
  ];
  return chatCompletion(cfg.apiKey, cfg.model, messages);
}

export async function rewriteCaptionWithOpenRouter(original: string): Promise<string> {
  const cfg = getRewriteCaptionConfigOrThrow();
  return rewriteCaptionWithConfig(cfg, original);
}

async function chatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  return withRetry(
    async () => {
      const res = await axios.post<{
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
      }>(
        'https://openrouter.ai/api/v1/chat/completions',
        { model, messages, temperature: 0.7 },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/okfanpage',
            'X-Title': 'okfanpage',
          },
          timeout: 120_000,
          validateStatus: () => true,
        },
      );
      const data = res.data;

      if (isRetryableHttpStatus(res.status)) {
        const ra = parseRetryAfterMsFromHeaders(res.headers);
        throw new TransientRequestError(`OpenRouter HTTP ${res.status}`, {
          httpStatus: res.status,
          retryAfterMs: ra,
        });
      }

      if (res.status >= 400) {
        throw new Error(data.error?.message ?? `OpenRouter HTTP ${res.status}`);
      }
      if (data.error?.message) {
        throw new Error(data.error.message);
      }
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new Error('OpenRouter không trả nội dung hợp lệ.');
      }
      return text;
    },
    {
      maxAttempts: REUP_HTTP_MAX_ATTEMPTS,
      baseDelayMs: REUP_HTTP_RETRY_BASE_MS,
      maxDelayMs: REUP_HTTP_RETRY_MAX_MS,
      isRetryable: (e) =>
        e instanceof TransientRequestError || isRetryableAxiosError(e),
      getRetryAfterMs: getRetryAfterMsFromAxiosError,
    },
  );
}

function parseRetryAfterMsFromHeaders(
  headers: Record<string, unknown> | undefined,
): number | undefined {
  if (!headers) {
    return undefined;
  }
  const raw =
    headers['retry-after'] ??
    headers['Retry-After'] ??
    (typeof (headers as { get?: (k: string) => string }).get === 'function'
      ? (headers as { get: (k: string) => string }).get('retry-after')
      : undefined);
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
