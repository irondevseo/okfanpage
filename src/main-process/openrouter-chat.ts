import axios from 'axios';
import type { CompetitorPostCompact } from '../shared/competitor-analysis-types';
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

/** Chỉ cần API key + model (không dùng prompt nội dung reup). */
export function getOpenRouterApiConfigOrThrow(): { apiKey: string; model: string } {
  const secrets = getOpenRouterSecrets();
  if (!secrets?.apiKey) {
    throw new Error('Chưa cấu hình OpenRouter (API key) trong Cài đặt.');
  }
  return { apiKey: secrets.apiKey, model: secrets.modelId };
}

export type CompetitorAnalyzeBundle = {
  pageId: string;
  pageName: string;
  sourceUrl: string;
  posts: CompetitorPostCompact[];
};

function shrinkPostForCompetitorPrompt(p: CompetitorPostCompact) {
  return {
    id: p.id,
    t: p.t,
    txt: p.txt.length > 4000 ? `${p.txt.slice(0, 4000)}…` : p.txt,
    ...(p.txtTruncated ? { captionMeta: 'truncated_in_fetch' as const } : {}),
    mediaTypes: p.mediaTypes,
    hasPreviewImage: Boolean(p.primaryImageUrl),
    comments: p.comments.slice(0, 25).map((c) =>
      c.length > 350 ? `${c.slice(0, 350)}…` : c,
    ),
    cmtCount: p.cmtCount,
  };
}

const COMPETITOR_ANALYSIS_SYSTEM = `Bạn là chuyên gia phân tích nội dung Fanpage Facebook (đối thủ). Dữ liệu là JSON đã rút gọn: mỗi bài có id, thời gian ISO (t), caption (txt), loại media (mediaTypes), có/không ảnh thumbnail (hasPreviewImage), mẫu comment và cmtCount (số comment Graph trả trong batch, có thể lớn hơn số comment text).

Trả lời bằng tiếng Việt, Markdown rõ ràng:
1. **Tổng quan** — phong cách & chủ đề chính; nếu nhiều page thì so sánh ngắn gọn.
2. **Lịch đăng & nhịp độ** — khung giờ/ngày suy ra từ t, nhịp đăng tương đối.
3. **Nội dung & hình ảnh** — video/ảnh/link (từ mediaTypes + hasPreviewImage), gợi ý trọng tâm sản xuất.
4. **Khán giả qua comment** — tông cảm xúc, câu hỏi, tranh luận, nội dung rác/spam (nhận định thận trọng, không vu khống).
5. **Khác biệt & cơ hội** — khoảng trống, góc nội dung có thể khai thác.
6. **Gợi ý hành động** — 5 bullet cụ thể, khả thi.

Không bịa số liệu không có trong JSON. Nếu dữ liệu mỏng, nêu rõ giới hạn.`;

export async function competitorAnalyzeWithOpenRouter(
  bundles: CompetitorAnalyzeBundle[],
  options?: { userHint?: string; maxPostsPerPage?: number },
): Promise<string> {
  const cfg = getOpenRouterApiConfigOrThrow();
  const maxPosts = Math.min(50, Math.max(1, options?.maxPostsPerPage ?? 25));
  const slim = bundles.map((b) => ({
    pageId: b.pageId,
    pageName: b.pageName,
    sourceUrl: b.sourceUrl,
    posts: b.posts.slice(0, maxPosts).map(shrinkPostForCompetitorPrompt),
  }));
  const hint = options?.userHint?.trim();
  const userContent = [
    'Dữ liệu JSON (một dòng):',
    JSON.stringify(slim),
    hint ? `\nYêu cầu thêm từ người dùng:\n${hint}` : '',
    '\nHãy phân tích theo hướng dẫn hệ thống.',
  ].join('');
  const messages: ChatMessage[] = [
    { role: 'system', content: COMPETITOR_ANALYSIS_SYSTEM },
    { role: 'user', content: userContent },
  ];
  return chatCompletion(cfg.apiKey, cfg.model, messages, 0.55);
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
  temperature = 0.7,
): Promise<string> {
  return withRetry(
    async () => {
      const res = await axios.post<{
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
      }>(
        'https://openrouter.ai/api/v1/chat/completions',
        { model, messages, temperature },
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
