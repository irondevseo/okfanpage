import { ipcMain } from 'electron';
import type {
  ReupFetchSourcesResult,
  ReupRewriteResult,
  ReupScheduleBatchResult,
  ReupScheduleJobPayload,
} from '../shared/reup-types';
import { getStoredFacebookCookies } from './auth-ipc';
import { logAuthAxiosError } from './auth-logger';
import {
  extractAccessToken,
  isInvalidFacebookSession,
  isLikelyNetworkError,
} from './facebook-auth';
import {
  fetchReupSourcesFromUrlBlock,
  postScheduledPageVideo,
} from './facebook-reup';
import { rewriteCaptionWithOpenRouter } from './openrouter-chat';

export function registerReupIpc(): void {
  ipcMain.handle(
    'reup:fetchSources',
    async (_e, text: string): Promise<ReupFetchSourcesResult> => {
      const cookies = getStoredFacebookCookies();
      if (!cookies) {
        return {
          ok: false,
          code: 'NO_COOKIE',
          message: 'Chưa đăng nhập hoặc chưa có cookie Facebook.',
        };
      }
      try {
        const userToken = await extractAccessToken(cookies);
        const data = await fetchReupSourcesFromUrlBlock(
          typeof text === 'string' ? text : '',
          userToken,
          cookies,
        );
        return data;
      } catch (err) {
        logAuthAxiosError('reup:fetchSources', err);
        if (isLikelyNetworkError(err)) {
          return {
            ok: false,
            code: 'NETWORK',
            message: 'Lỗi mạng khi tải nguồn video.',
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
          message: err instanceof Error ? err.message : 'Không tải được nguồn.',
        };
      }
    },
  );

  ipcMain.handle(
    'reup:rewriteCaptions',
    async (
      _e,
      items: { key: string; text: string }[],
    ): Promise<ReupRewriteResult> => {
      if (!Array.isArray(items) || items.length === 0) {
        return { ok: false, message: 'Không có nội dung để viết lại.' };
      }
      try {
        const out: { key: string; text: string }[] = [];
        for (const it of items) {
          const next = await rewriteCaptionWithOpenRouter(it.text ?? '');
          out.push({ key: it.key, text: next });
        }
        return { ok: true, items: out };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Viết lại thất bại.',
        };
      }
    },
  );

  ipcMain.handle(
    'reup:scheduleVideos',
    async (
      _e,
      jobs: ReupScheduleJobPayload[],
    ): Promise<ReupScheduleBatchResult> => {
      const cookies = getStoredFacebookCookies() ?? '';
      const out: ReupScheduleBatchResult['jobs'] = [];
      if (!Array.isArray(jobs) || jobs.length === 0) {
        return { jobs: [] };
      }
      for (const job of jobs) {
        try {
          if (!job.fileUrl?.trim()) {
            out.push({
              ok: false,
              videoKey: job.videoKey,
              targetPageId: job.targetPageId,
              message: 'Thiếu URL file video (source).',
            });
            continue;
          }
          const res = await postScheduledPageVideo(
            job.targetPageId,
            job.pageAccessToken,
            job.fileUrl.trim(),
            job.description ?? '',
            job.scheduledPublishTime,
            cookies,
          );
          out.push({
            ok: true,
            videoKey: job.videoKey,
            targetPageId: job.targetPageId,
            postId: res.id,
          });
        } catch (err) {
          out.push({
            ok: false,
            videoKey: job.videoKey,
            targetPageId: job.targetPageId,
            message: err instanceof Error ? err.message : 'Đăng lịch thất bại.',
          });
        }
      }
      return { jobs: out };
    },
  );
}
