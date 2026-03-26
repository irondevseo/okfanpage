import axios, { isAxiosError } from 'axios';
import type { FacebookProfile } from '../shared/auth-types';
import { logAuthAxiosError, logAuthPhase, previewText } from './auth-logger';

const ADS_URL =
  'https://adsmanager.facebook.com/adsmanager/manage/campaigns';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

/** Cookie dán từ DevTools thường có xuống dòng — header HTTP không hợp lệ → dễ bị 400. */
export function normalizeFacebookCookieString(raw: string): string {
  return raw
    .trim()
    .replace(/\r\n/g, '')
    .replace(/\r/g, '')
    .replace(/\n/g, '')
    .replace(/\t/g, ' ');
}

/**
 * Lấy access token (EAAB…) từ HTML Ads Manager bằng cookie đăng nhập Facebook.
 */
export async function extractAccessToken(cookies: string): Promise<string> {
  const trimmed = normalizeFacebookCookieString(cookies);
  if (!trimmed) {
    logAuthPhase('extract-token', { error: 'empty_cookie' });
    throw new Error('Cookie trống.');
  }

  const cookieLen = trimmed.length;
  const hasCUser = /\bc_user=/.test(trimmed);
  const hasXs = /\bxs=/.test(trimmed);
  logAuthPhase('ads-request', {
    url: ADS_URL,
    cookieLength: cookieLen,
    hasCUser,
    hasXs,
  });

  let response;
  try {
    response = await axios.get<string>(ADS_URL, {
      headers: {
        ...BROWSER_HEADERS,
        Cookie: trimmed,
      },
      maxRedirects: 7,
      responseType: 'text',
      validateStatus: () => true,
      timeout: 60_000,
    });
  } catch (err) {
    logAuthAxiosError('ads-request-failed', err);
    throw err;
  }

  const status = response.status;
  const html =
    typeof response.data === 'string' ? response.data : String(response.data);

  if (status < 200 || status >= 400) {
    logAuthPhase('ads-manager-http-error', {
      status,
      statusText: response.statusText,
      contentType: response.headers['content-type'],
      bodyPreview: previewText(html),
    });
    if (status >= 500) {
      throw new Error(
        `Ads Manager máy chủ tạm lỗi (HTTP ${status}). Thử lại sau — xem log [okfanpage:auth] trong terminal.`,
      );
    }
    throw new Error(
      `Ads Manager trả về HTTP ${status}. ` +
        'Cookie có thể sai định dạng (bỏ hết xuống dòng khi dán), hết hạn, hoặc thiếu quyền Ads. ' +
        'Mở terminal chạy `npm run start` để xem log chi tiết [okfanpage:auth].',
    );
  }

  const tokenMatch = html.match(/EAAB[^\s"'<\\]+/);
  if (!tokenMatch) {
    logAuthPhase('ads-manager-no-token', {
      status,
      htmlLength: html.length,
      bodyPreview: previewText(html),
    });
    throw new Error(
      'Không tìm thấy access token trong Ads Manager. Cookie có thể đã hết hạn hoặc không đủ quyền.',
    );
  }

  logAuthPhase('ads-token-ok', { tokenPrefix: `${tokenMatch[0].slice(0, 8)}…` });
  return tokenMatch[0];
}

export async function fetchFacebookProfile(
  accessToken: string,
  cookies:string
): Promise<FacebookProfile> {
  const graphUrl = 'https://graph.facebook.com/v21.0/me';
  let status: number;
  let data: {
    id?: string;
    name?: string;
    picture?: { data?: { url?: string } };
    error?: { message?: string; code?: number };
  };

  try {
    const res = await axios.get<typeof data>(graphUrl, {
      params: {
        fields: 'id,name,picture.type(large)',
        access_token: accessToken,
      },
      headers: {
        Cookie: cookies,
      },
      validateStatus: () => true,
      timeout: 30_000,
    });
    status = res.status;
    data = res.data;
  } catch (err) {
    logAuthAxiosError('graph-request-failed', err);
    throw err;
  }

  if (data.error) {
    const code = data.error.code;
    const msg = data.error.message ?? 'Token Facebook không hợp lệ.';
    logAuthPhase('graph-api-error', {
      status,
      graphCode: code,
      graphMessage: msg,
    });
    const err = new Error(msg) as Error & { graphCode?: number };
    err.graphCode = code;
    throw err;
  }

  if (status >= 400 || !data.id) {
    logAuthPhase('graph-api-bad-response', {
      status,
      bodyPreview: previewText(JSON.stringify(data)),
    });
    throw new Error('Không đọc được thông tin profile hoặc token đã hết hạn.');
  }

  logAuthPhase('graph-profile-ok', { id: data.id });
  return {
    id: data.id,
    name: data.name ?? data.id,
    pictureUrl: data.picture?.data?.url ?? '',
  };
}

export async function profileFromCookies(
  cookies: string,
): Promise<FacebookProfile> {
  const token = await extractAccessToken(cookies);
  return fetchFacebookProfile(token, cookies);
}

export function isLikelyNetworkError(err: unknown): boolean {
  if (!isAxiosError(err)) {
    return false;
  }
  if (err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND') {
    return true;
  }
  if (err.message === 'Network Error') {
    return true;
  }
  return !err.response;
}

export function isInvalidFacebookSession(err: unknown): boolean {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401) {
      return true;
    }
    const data = err.response?.data as
      | { error?: { code?: number } }
      | undefined;
    const code = data?.error?.code;
    if (code === 190 || code === 102) {
      return true;
    }
  }
  if (err instanceof Error) {
    if (err.message.includes('Không tìm thấy access token')) {
      return true;
    }
    if (err.message.includes('Cookie trống')) {
      return true;
    }
    if (err.message.includes('Ads Manager trả về HTTP')) {
      return true;
    }
    const graphCode = (err as Error & { graphCode?: number }).graphCode;
    if (graphCode === 190 || graphCode === 102) {
      return true;
    }
  }
  return false;
}
