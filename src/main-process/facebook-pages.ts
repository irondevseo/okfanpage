import axios from 'axios';
import type { FanPage } from '../shared/fanpage-types';
import { logAuthPhase, previewText } from './auth-logger';

const GRAPH_VERSION = 'v21.0';

/** Fields Graph cho Page — cần quyền tương ứng trên user token. */
const PAGE_FIELDS = [
  'id',
  'name',
  'access_token',
  'picture.type(large){url}',
  'fan_count',
  'followers_count',
  'verification_status',
  'category',
  'link',
  'is_published',
].join(',');

type RawPage = {
  id: string;
  name: string;
  access_token?: string;
  picture?: { data?: { url?: string } };
  fan_count?: number;
  followers_count?: number;
  verification_status?: string;
  category?: string;
  link?: string;
  is_published?: boolean;
};


type AccountsResponse = {
  data?: RawPage[];
  error?: { message: string; code?: number };
};

function mapRawPage(p: RawPage): FanPage {
  return {
    id: p.id,
    name: p.name,
    pageAccessToken: p.access_token ?? '',
    pictureUrl: p.picture?.data?.url ?? '',
    fanCount: typeof p.fan_count === 'number' ? p.fan_count : null,
    followersCount: typeof p.followers_count === 'number' ? p.followers_count : null,
    verificationStatus: p.verification_status ?? null,
    category: p.category ?? null,
    link: p.link ?? null,
    isPublished: typeof p.is_published === 'boolean' ? p.is_published : null,
  };
}

export async function fetchManagedFanPages(
  userAccessToken: string,
  cookies: string,
): Promise<FanPage[]> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts`;
  const { data } = await axios.get<AccountsResponse>(url, {
    params: {
      access_token: userAccessToken,
      fields: PAGE_FIELDS,
      limit: 100,
    },
    headers: {
      Cookie: cookies,
    },
    validateStatus: () => true,
    timeout: 60_000,
  });

  if (data.error) {
    logAuthPhase('graph-me-accounts-error', {
      code: data.error.code,
      message: data.error.message,
    });
    throw new Error(data.error.message);
  }

  const list = data.data ?? [];
  logAuthPhase('graph-me-accounts-ok', { count: list.length });
  return list.map(mapRawPage);
}

/** Fallback khi Graph báo lỗi field (100). */
const PAGE_FIELDS_MINIMAL = [
  'id',
  'name',
  'access_token',
  'picture.type(large){url}',
].join(',');

export async function fetchManagedFanPagesWithFallback(
  userAccessToken: string,
  cookies: string,
): Promise<FanPage[]> {
  try {
    return await fetchManagedFanPages(userAccessToken, cookies);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    const isFieldError =
      msg.includes('(100)') ||
      msg.toLowerCase().includes('invalid field') ||
      msg.toLowerCase().includes('nonexisting field');
    if (!isFieldError) {
      throw err;
    }
    logAuthPhase('graph-me-accounts-retry-minimal-fields', { reason: previewText(msg, 200) });
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts`;
    const { data } = await axios.get<AccountsResponse>(url, {
      params: {
        access_token: userAccessToken,
        fields: PAGE_FIELDS_MINIMAL,
        limit: 100,
      },
      validateStatus: () => true,
      timeout: 60_000,
    });
    if (data.error) {
      throw new Error(data.error.message);
    }
    const list = data.data ?? [];
    return list.map(mapRawPage);
  }
}
