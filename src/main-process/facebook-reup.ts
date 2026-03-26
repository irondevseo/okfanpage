import axios from 'axios';
import { parseFacebookPageUrlsBlock } from '../helpers/facebookPageLinks';
import type {
  ReupFetchPageResult,
  ReupFetchSourcesResult,
  ReupVideoDTO,
} from '../shared/reup-types';
import { logAuthPhase, previewText } from './auth-logger';

const GRAPH_VERSION = 'v21.0';

const VIDEO_FIELDS_PRIMARY =
  'id,description,source,permalink_url,thumbnails{uri,is_preferred},picture,length,created_time,views';

const VIDEO_FIELDS_FALLBACK =
  'id,description,source,permalink_url,thumbnails{uri,is_preferred},picture,length,created_time';

type GraphErr = { error?: { message?: string; code?: number } };

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

export async function postScheduledPageVideo(
  targetPageId: string,
  pageAccessToken: string,
  fileUrl: string,
  description: string,
  scheduledPublishTime: number,
  cookies: string,
): Promise<{ id?: string }> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${targetPageId}/videos`;
  const body = new URLSearchParams({
    file_url: fileUrl,
    description,
    published: 'false',
    scheduled_publish_time: String(scheduledPublishTime),
    access_token: pageAccessToken,
  });
  const { data } = await axios.post<GraphErr & { id?: string }>(url, body.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...graphHeaders(cookies),
    },
    validateStatus: () => true,
    timeout: 120_000,
  });
  if (data.error?.message) {
    throw new Error(data.error.message);
  }
  return { id: data.id };
}
