import axios from 'axios';
import { mapGraphPostsDataToCompact } from '../helpers/mapGraphPostToCompetitorCompact';
import type { CompetitorPostCompact } from '../shared/competitor-analysis-types';
import { logAuthPhase, previewText } from './auth-logger';

const GRAPH_VERSION = 'v21.0';

type GraphErr = { error?: { message?: string; code?: number } };

function graphHeaders(cookies: string): Record<string, string> {
  return cookies ? { Cookie: cookies } : {};
}

function buildFieldsWithComments(commentsLimit: number): string {
  const n = Math.max(1, Math.min(100, Math.floor(commentsLimit)));
  return [
    'message',
    'created_time',
    'attachments{media,media_type}',
    'full_picture',
    `comments.limit(${n}){message}`,
  ].join(',');
}

const FIELDS_NO_COMMENTS = [
  'message',
  'created_time',
  'attachments{media,media_type}',
  'full_picture',
].join(',');

type PostsResponse = GraphErr & { data?: unknown[] };

type FetchEdgeResult = { rows: unknown[]; errorMessage: string | null };

/**
 * Resolve id + name; metadata=1 để từ chối User/Group (profile.php?id= thường là User).
 */
async function graphResolveCompetitorNode(
  pageIdentifier: string,
  userAccessToken: string,
  cookies: string,
): Promise<{ id: string; name: string }> {
  const id = pageIdentifier.trim();
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(id)}`;

  type NodePayload = GraphErr & {
    id?: string;
    name?: string;
    metadata?: { type?: string };
  };

  const fetchNode = async (withMetadata: boolean) =>
    axios.get<NodePayload>(url, {
      params: withMetadata
        ? {
            access_token: userAccessToken,
            fields: 'id,name',
            metadata: 1,
          }
        : {
            access_token: userAccessToken,
            fields: 'id,name',
          },
      headers: graphHeaders(cookies),
      validateStatus: () => true,
      timeout: 45_000,
    });

  let { data, status } = await fetchNode(true);
  if (data.error?.message) {
    const em = data.error.message;
    if (/metadata/i.test(em) && !/permission|access|token/i.test(em)) {
      ({ data, status } = await fetchNode(false));
    } else {
      throw new Error(em);
    }
  }
  if (data.error?.message) {
    throw new Error(data.error.message);
  }
  if (status < 200 || status >= 300 || !data.id) {
    throw new Error('Không lấy được id từ Graph.');
  }
  const nodeType = data.metadata?.type?.toLowerCase?.();
  if (nodeType === 'user') {
    throw new Error(
      'Link này là trang cá nhân (User), không phải Fanpage. Graph API không cho đọc dòng bài của User như Page. Hãy mở đúng Fanpage (URL dạng facebook.com/ten-trang hoặc Page có username).',
    );
  }
  if (nodeType === 'group') {
    throw new Error(
      'Đây là Group Facebook. Module đối thủ chỉ hỗ trợ Fanpage; hãy dùng URL Page.',
    );
  }
  return { id: data.id, name: data.name ?? data.id };
}

async function fetchPostsFromEdge(
  pageId: string,
  edge: 'posts' | 'published_posts' | 'feed',
  fields: string,
  userAccessToken: string,
  cookies: string,
  limit: number,
): Promise<FetchEdgeResult> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}/${edge}`;
  const { data, status } = await axios.get<PostsResponse>(url, {
    params: {
      access_token: userAccessToken,
      fields,
      limit,
    },
    headers: graphHeaders(cookies),
    validateStatus: () => true,
    timeout: 90_000,
  });
  if (data.error?.message) {
    return { rows: [], errorMessage: data.error.message };
  }
  if (status < 200 || status >= 300) {
    return { rows: [], errorMessage: `Graph HTTP ${status}` };
  }
  const rows = Array.isArray(data.data) ? data.data : [];
  return { rows, errorMessage: null };
}

function enhanceGraphErrorMessage(msg: string): string {
  const m = msg.toLowerCase();
  if (
    m.includes('pages_read_engagement') ||
    m.includes('page public content') ||
    m.includes('pages_read_user_content')
  ) {
    return `${msg} — Với Page không quản trị, app Meta thường cần quyền pages_read_engagement và/hoặc Page Public Content Access (PPCA).`;
  }
  return msg;
}

/**
 * Lấy bài từ Fanpage: thử posts → published_posts → feed; nếu lỗi do comments thì thử lại không comments.
 */
export async function fetchCompetitorPagePosts(
  pageIdentifier: string,
  userAccessToken: string,
  cookies: string,
  options: { limit: number; commentsLimit: number },
): Promise<{
  pageId: string;
  pageName: string;
  posts: CompetitorPostCompact[];
}> {
  const { id: pageId, name: pageName } = await graphResolveCompetitorNode(
    pageIdentifier,
    userAccessToken,
    cookies,
  );
  const limit = Math.max(1, Math.min(100, Math.floor(options.limit)));
  const fieldsWithComments = buildFieldsWithComments(options.commentsLimit);

  const attempts: Array<{
    edge: 'posts' | 'published_posts' | 'feed';
    fields: string;
    label: string;
  }> = [
    { edge: 'posts', fields: fieldsWithComments, label: 'posts+comments' },
    { edge: 'posts', fields: FIELDS_NO_COMMENTS, label: 'posts' },
    {
      edge: 'published_posts',
      fields: fieldsWithComments,
      label: 'published_posts+comments',
    },
    { edge: 'published_posts', fields: FIELDS_NO_COMMENTS, label: 'published_posts' },
    { edge: 'feed', fields: FIELDS_NO_COMMENTS, label: 'feed' },
  ];

  let lastError: string | null = null;
  let sawOkEmpty = false;

  for (const a of attempts) {
    const { rows, errorMessage } = await fetchPostsFromEdge(
      pageId,
      a.edge,
      a.fields,
      userAccessToken,
      cookies,
      limit,
    );
    if (errorMessage) {
      lastError = errorMessage;
      logAuthPhase('competitor-posts-attempt-fail', {
        edge: a.edge,
        label: a.label,
        message: previewText(errorMessage, 200),
      });
      continue;
    }
    if (rows.length > 0) {
      logAuthPhase('competitor-posts-attempt-ok', {
        edge: a.edge,
        label: a.label,
        count: rows.length,
      });
      const posts = mapGraphPostsDataToCompact(rows);
      return { pageId, pageName, posts };
    }
    sawOkEmpty = true;
    logAuthPhase('competitor-posts-attempt-empty', { edge: a.edge, label: a.label });
  }

  if (sawOkEmpty) {
    return { pageId, pageName, posts: [] };
  }
  throw new Error(enhanceGraphErrorMessage(lastError ?? 'Không tải được bài viết từ Graph.'));
}
