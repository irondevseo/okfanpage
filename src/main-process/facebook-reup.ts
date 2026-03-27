import axios from 'axios';
import { parseFacebookPageUrlsBlock } from '../helpers/facebookPageLinks';
import type { ReupFetchPageResult, ReupVideoDTO } from '../shared/reup-types';
import { logAuthPhase, previewText } from './auth-logger';
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

const GRAPH_VERSION = 'v21.0';

const VIDEO_FIELDS_PRIMARY =
  'id,description,source,permalink_url,thumbnails{uri,is_preferred},picture,length,created_time,views';

const VIDEO_FIELDS_FALLBACK =
  'id,description,source,permalink_url,thumbnails{uri,is_preferred},picture,length,created_time';

type GraphErr = { error?: { message?: string; code?: number } };

function graphRateLimitRetry(
  status: number,
  data: GraphErr & { id?: string },
): boolean {
  if (status === 429) {
    return true;
  }
  const c = data?.error?.code;
  if (typeof c !== 'number') {
    return false;
  }
  /** Application / user / Page limit, custom throttle — Graph docs & thực tế hay gặp. */
  return c === 4 || c === 17 || c === 32 || c === 613;
}

function retryAfterMsFromGraphHeaders(
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

function graphHeaders(cookies: string): Record<string, string> {
  return cookies ? { Cookie: cookies } : {};
}

export async function graphResolvePage(
  identifier: string,
  userToken: string,
  cookies: string,
): Promise<{ id: string; name: string }> {
  const id = identifier.trim();
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(id)}`;
  const { data } = await axios.get<GraphErr & { id?: string; name?: string }>(url, {
    params: { access_token: userToken, fields: 'id,name' },
    headers: graphHeaders(cookies),
    validateStatus: () => true,
    timeout: 45_000,
  });
  if (data.error?.message) {
    throw new Error(data.error.message);
  }
  if (!data.id) {
    throw new Error('Không lấy được Page id từ Graph.');
  }
  return { id: data.id, name: data.name ?? data.id };
}

function pickPicture(raw: Record<string, unknown>): string | null {
  const p = raw.picture;
  if (typeof p === 'string') {
    return p;
  }
  if (p && typeof p === 'object' && 'data' in p) {
    const u = (p as { data?: { url?: string } }).data?.url;
    return u ?? null;
  }
  return null;
}

function mapVideo(
  raw: Record<string, unknown>,
  sourcePageId: string,
  sourcePageName: string,
): ReupVideoDTO | null {
  const id = raw.id as string | undefined;
  if (!id) {
    return null;
  }
  const thumbs: string[] = [];
  const thumbsRaw = raw.thumbnails as
    | { data?: Array<{ uri?: string; is_preferred?: boolean }> }
    | undefined;
  const arr = thumbsRaw?.data ?? [];
  const sorted = [...arr].sort((a, b) =>
    a.is_preferred === b.is_preferred ? 0 : a.is_preferred ? -1 : 1,
  );
  for (const t of sorted) {
    if (t.uri && thumbs.length < 6) {
      thumbs.push(t.uri);
    }
  }
  return {
    id,
    sourcePageId,
    sourcePageName,
    sourceUrl: (raw.source as string | undefined) ?? null,
    description: (raw.description as string | undefined) ?? '',
    permalinkUrl: (raw.permalink_url as string | undefined) ?? null,
    picture: pickPicture(raw),
    thumbnails: thumbs.slice(0, 3),
    views: typeof raw.views === 'number' ? raw.views : null,
  };
}

async function fetchPageVideosOnce(
  pageId: string,
  userToken: string,
  cookies: string,
  fields: string,
): Promise<ReupVideoDTO[]> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/videos`;
  const { data } = await axios.get<
    GraphErr & { data?: Array<Record<string, unknown>> }
  >(url, {
    params: {
      access_token: userToken,
      fields,
      limit: 100,
    },
    headers: graphHeaders(cookies),
    validateStatus: () => true,
    timeout: 90_000,
  });
  if (data.error?.message) {
    throw new Error(data.error.message);
  }
  const list = data.data ?? [];
  const pageMeta = { id: pageId, name: '' };
  return list
    .map((v) => mapVideo(v as Record<string, unknown>, pageMeta.id, pageMeta.name))
    .filter((x): x is ReupVideoDTO => x !== null);
}

async function fetchPageVideos(
  pageId: string,
  pageName: string,
  userToken: string,
  cookies: string,
): Promise<ReupVideoDTO[]> {
  let videos: ReupVideoDTO[];
  try {
    videos = await fetchPageVideosOnce(pageId, userToken, cookies, VIDEO_FIELDS_PRIMARY);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('(100)') || msg.toLowerCase().includes('invalid')) {
      videos = await fetchPageVideosOnce(pageId, userToken, cookies, VIDEO_FIELDS_FALLBACK);
    } else {
      throw e;
    }
  }
  return videos.map((v) => ({ ...v, sourcePageName: pageName }));
}

export async function fetchReupSourcesFromUrlBlock(
  text: string,
  userToken: string,
  cookies: string,
): Promise<{ ok: true; results: ReupFetchPageResult[] }> {
  const refs = parseFacebookPageUrlsBlock(text);
  const results: ReupFetchPageResult[] = [];
  for (const ref of refs) {
    const label = ref.rawUrl;
    try {
      const resolved = await graphResolvePage(ref.value, userToken, cookies);
      logAuthPhase('reup-resolve-page', {
        label: previewText(label, 80),
        id: resolved.id,
      });
      const videos = await fetchPageVideos(resolved.id, resolved.name, userToken, cookies);
      results.push({
        ok: true,
        inputLabel: label,
        page: resolved,
        videos,
      });
    } catch (err) {
      results.push({
        ok: false,
        inputLabel: label,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return { ok: true, results };
}

function maskToken(t: string): string {
  const s = t.trim();
  if (s.length <= 12) {
    return '(ngắn)';
  }
  return `${s.slice(0, 8)}…${s.slice(-4)}`;
}

/**
 * Đăng video lên Page (hẹn giờ). Graph: POST /{page-id}/videos
 * @see https://developers.facebook.com/docs/graph-api/reference/page/videos
 */
export type PostScheduledPageVideoOptions = {
  /** Batch lớn: bớt log từng request để giảm I/O. */
  compactLog?: boolean;
};

export async function postScheduledPageVideo(
  targetPageId: string,
  pageAccessToken: string,
  fileUrl: string,
  description: string,
  scheduledPublishTime: number,
  cookies: string,
  options?: PostScheduledPageVideoOptions,
): Promise<{ id?: string }> {
  const compact = options?.compactLog ?? false;

  if (!compact) {
    logAuthPhase('reup-post-video-start', {
      targetPageId,
      graphPath: `/${GRAPH_VERSION}/${targetPageId}/videos`,
      scheduledPublishTime: Math.floor(scheduledPublishTime),
      fileUrlLength: fileUrl.length,
      fileUrlPreview: previewText(fileUrl, 120),
      descriptionLength: (description ?? '').length,
      hasCookieHeader: Boolean(cookies?.trim()),
      accessTokenMask: maskToken(pageAccessToken),
    });
  }

  return withRetry(
    async () => {
      const url = `https://graph.facebook.com/${GRAPH_VERSION}/${targetPageId}/videos`;
      const body = new URLSearchParams({
        file_url: fileUrl,
        description: description ?? '',
        published: 'false',
        scheduled_publish_time: String(Math.floor(scheduledPublishTime)),
        access_token: pageAccessToken,
      });

      const res = await axios.post<GraphErr & { id?: string }>(url, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          ...graphHeaders(cookies),
        },
        validateStatus: () => true,
        timeout: 120_000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      const data = res.data;
      const hdrs = res.headers as Record<string, unknown>;

      if (!compact) {
        logAuthPhase('reup-post-video-http', {
          httpStatus: res.status,
          hasId: Boolean(data?.id),
          videoId: data?.id ?? null,
          graphError: data?.error ?? null,
          rawPreview:
            typeof data === 'object' && data !== null
              ? previewText(JSON.stringify(data), 500)
              : String(data),
        });
      }

      if (isRetryableHttpStatus(res.status) || graphRateLimitRetry(res.status, data)) {
        const ra = retryAfterMsFromGraphHeaders(hdrs);
        throw new TransientRequestError(
          data?.error?.message ?? `Graph HTTP ${res.status} (rate / tạm thời)`,
          { httpStatus: res.status, retryAfterMs: ra },
        );
      }

      if (res.status >= 400) {
        const msg =
          data?.error?.message ??
          `HTTP ${res.status} khi POST /videos`;
        throw new Error(msg);
      }

      if (data?.error?.message) {
        throw new Error(
          `${data.error.message}${data.error.code != null ? ` (code ${data.error.code})` : ''}`,
        );
      }

      if (!data?.id) {
        throw new Error(
          'Graph không trả id video — kiểm tra quyền page token và tham số hẹn giờ.',
        );
      }

      if (!compact) {
        logAuthPhase('reup-post-video-success', { videoId: data.id });
      }
      return { id: data.id };
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
