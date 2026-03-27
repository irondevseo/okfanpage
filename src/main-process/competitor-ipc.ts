import { ipcMain } from 'electron';
import type {
  CompetitorAnalyzePayload,
  CompetitorAnalyzeResult,
  CompetitorFetchPostsPayload,
  CompetitorFetchPostsResult,
  CompetitorPagePostsResult,
} from '../shared/competitor-analysis-types';
import { parseFacebookPageUrlsBlock } from '../helpers/facebookPageLinks';
import { getStoredFacebookCookies } from './auth-ipc';
import { logAuthAxiosError } from './auth-logger';
import { extractAccessToken, isInvalidFacebookSession, isLikelyNetworkError } from './facebook-auth';
import { fetchCompetitorPagePosts } from './facebook-competitor-posts';
import { competitorAnalyzeWithOpenRouter } from './openrouter-chat';

const DEFAULT_LIMIT = 25;
const DEFAULT_COMMENTS = 50;
const DEFAULT_MAX_PAGES = 3;

export function registerCompetitorIpc(): void {
  ipcMain.handle(
    'competitor:fetchPosts',
    async (_e, payload: CompetitorFetchPostsPayload): Promise<CompetitorFetchPostsResult> => {
      const cookies = getStoredFacebookCookies();
      if (!cookies) {
        return {
          ok: false,
          code: 'NO_COOKIE',
          message: 'Chưa đăng nhập hoặc chưa có cookie Facebook.',
        };
      }
      const text = typeof payload?.pageUrlsText === 'string' ? payload.pageUrlsText : '';
      const maxPages = Math.max(1, Math.min(3, payload?.maxPages ?? DEFAULT_MAX_PAGES));
      const refs = parseFacebookPageUrlsBlock(text).slice(0, maxPages);
      if (refs.length === 0) {
        return {
          ok: false,
          code: 'NO_PAGES',
          message: 'Không có URL Page hợp lệ (mỗi dòng một link facebook.com/...).',
        };
      }
      const limit = payload?.limit ?? DEFAULT_LIMIT;
      const commentsLimit = payload?.commentsLimit ?? DEFAULT_COMMENTS;
      try {
        const userToken = await extractAccessToken(cookies);
        const results: CompetitorPagePostsResult[] = [];
        for (const ref of refs) {
          try {
            const { pageId, pageName, posts } = await fetchCompetitorPagePosts(
              ref.value,
              userToken,
              cookies,
              { limit, commentsLimit },
            );
            results.push({
              ok: true,
              pageId,
              pageName,
              sourceUrl: ref.rawUrl,
              posts,
            });
          } catch (err) {
            results.push({
              ok: false,
              sourceUrl: ref.rawUrl,
              message: err instanceof Error ? err.message : 'Không tải được bài viết.',
            });
          }
        }
        return { ok: true, results };
      } catch (err) {
        logAuthAxiosError('competitor:fetchPosts', err);
        if (isLikelyNetworkError(err)) {
          return {
            ok: false,
            code: 'NETWORK',
            message: 'Lỗi mạng khi gọi Graph API.',
          };
        }
        if (isInvalidFacebookSession(err)) {
          return {
            ok: false,
            code: 'INVALID',
            message: err instanceof Error ? err.message : 'Phiên Facebook không hợp lệ.',
          };
        }
        return {
          ok: false,
          code: 'INVALID',
          message: err instanceof Error ? err.message : 'Không lấy được dữ liệu đối thủ.',
        };
      }
    },
  );

  ipcMain.handle(
    'competitor:analyze',
    async (_e, payload: CompetitorAnalyzePayload): Promise<CompetitorAnalyzeResult> => {
      const pages = payload?.pages;
      if (!Array.isArray(pages) || pages.length === 0) {
        return {
          ok: false,
          code: 'INVALID',
          message: 'Không có dữ liệu Page/bài viết để phân tích.',
        };
      }
      const hasPosts = pages.some(
        (p) => p && Array.isArray(p.posts) && p.posts.length > 0,
      );
      if (!hasPosts) {
        return {
          ok: false,
          code: 'INVALID',
          message: 'Chưa có bài viết nào — hãy tải dữ liệu trước.',
        };
      }
      try {
        const report = await competitorAnalyzeWithOpenRouter(pages, {
          userHint: typeof payload.userHint === 'string' ? payload.userHint : undefined,
          maxPostsPerPage: payload.maxPostsPerPage,
        });
        return { ok: true, report };
      } catch (err) {
        logAuthAxiosError('competitor:analyze', err);
        const msg = err instanceof Error ? err.message : 'Phân tích AI thất bại.';
        if (msg.includes('Chưa cấu hình OpenRouter')) {
          return { ok: false, code: 'NO_KEY', message: msg };
        }
        if (isLikelyNetworkError(err)) {
          return {
            ok: false,
            code: 'NETWORK',
            message: 'Lỗi mạng khi gọi OpenRouter.',
          };
        }
        return { ok: false, code: 'INVALID', message: msg };
      }
    },
  );
}
