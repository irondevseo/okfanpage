import { ipcMain } from 'electron';
import type {
  ReupFetchSourcesResult,
  ReupRewriteResult,
  ReupScheduleBatchResult,
  ReupScheduleJobPayload,
  ReupScheduleProgressPayload,
} from '../shared/reup-types';
import { getStoredFacebookCookies } from './auth-ipc';
import { logAuthAxiosError, logAuthPhase } from './auth-logger';
import { runPool } from './concurrency-pool';
import {
  extractAccessToken,
  isInvalidFacebookSession,
  isLikelyNetworkError,
} from './facebook-auth';
import {
  fetchReupSourcesFromUrlBlock,
  postScheduledPageVideo,
} from './facebook-reup';
import {
  getRewriteCaptionConfigOrThrow,
  rewriteCaptionWithConfig,
} from './openrouter-chat';
import {
  REUP_GRAPH_VIDEO_CONCURRENCY,
  REUP_OPENROUTER_CONCURRENCY,
  REUP_SCHEDULE_PROGRESS_EVERY,
} from './reup-batch-config';

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
      let cfg: ReturnType<typeof getRewriteCaptionConfigOrThrow>;
      try {
        cfg = getRewriteCaptionConfigOrThrow();
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Viết lại thất bại.',
        };
      }

      type Row =
        | { ok: true; key: string; text: string }
        | { ok: false; key: string; message: string };

      const rows = await runPool(items, REUP_OPENROUTER_CONCURRENCY, async (it) => {
        try {
          const text = await rewriteCaptionWithConfig(cfg, it.text ?? '');
          return { ok: true as const, key: it.key, text };
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Viết lại thất bại.';
          return { ok: false as const, key: it.key, message };
        }
      });

      const okItems = rows.filter((r): r is Row & { ok: true } => r.ok === true);
      const failed = rows.filter((r): r is Row & { ok: false } => r.ok === false);

      if (okItems.length === 0) {
        return {
          ok: false,
          message:
            failed[0]?.message ??
            'Tất cả caption đều lỗi (kiểm tra OpenRouter / mạng).',
        };
      }

      const result: ReupRewriteResult = {
        ok: true,
        items: okItems.map(({ key, text }) => ({ key, text })),
        failed:
          failed.length > 0
            ? failed.map(({ key, message }) => ({ key, message }))
            : undefined,
      };
      return result;
    },
  );

  ipcMain.handle(
    'reup:scheduleVideos',
    async (
      e,
      jobs: ReupScheduleJobPayload[],
    ): Promise<ReupScheduleBatchResult> => {
      const cookies = getStoredFacebookCookies() ?? '';
      if (!Array.isArray(jobs) || jobs.length === 0) {
        return { jobs: [] };
      }

      const total = jobs.length;
      logAuthPhase('reup-schedule-batch-start', {
        total,
        concurrency: REUP_GRAPH_VIDEO_CONCURRENCY,
      });

      let completed = 0;
      let successCount = 0;
      let failCount = 0;

      const sendProgress = (payload: ReupScheduleProgressPayload): void => {
        if (e.sender.isDestroyed()) {
          return;
        }
        e.sender.send('reup:scheduleProgress', payload);
      };

      sendProgress({
        completed: 0,
        total,
        successCount: 0,
        failCount: 0,
      });

      const rows = await runPool(jobs, REUP_GRAPH_VIDEO_CONCURRENCY, async (job) => {
        let row:
          | {
              ok: true;
              videoKey: string;
              targetPageId: string;
              postId?: string;
            }
          | {
              ok: false;
              videoKey: string;
              targetPageId: string;
              message: string;
            };

        try {
          if (!job.fileUrl?.trim()) {
            row = {
              ok: false,
              videoKey: job.videoKey,
              targetPageId: job.targetPageId,
              message: 'Thiếu URL file video (source).',
            };
          } else {
            const res = await postScheduledPageVideo(
              job.targetPageId,
              job.pageAccessToken,
              job.fileUrl.trim(),
              job.description ?? '',
              job.scheduledPublishTime,
              cookies,
              { compactLog: true },
            );
            row = {
              ok: true,
              videoKey: job.videoKey,
              targetPageId: job.targetPageId,
              postId: res.id,
            };
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Đăng lịch thất bại.';
          logAuthPhase('reup-schedule-job-error', {
            videoKey: job.videoKey,
            targetPageId: job.targetPageId,
            message,
          });
          row = {
            ok: false,
            videoKey: job.videoKey,
            targetPageId: job.targetPageId,
            message,
          };
        }

        completed += 1;
        if (row.ok === true) {
          successCount += 1;
        } else {
          failCount += 1;
        }

        sendProgress({
          completed,
          total,
          successCount,
          failCount,
          videoKey: row.videoKey,
          targetPageId: row.targetPageId,
          ok: row.ok,
          postId: row.ok === true ? row.postId : undefined,
          message: row.ok === false ? row.message : undefined,
        });

        if (
          REUP_SCHEDULE_PROGRESS_EVERY > 0 &&
          (completed % REUP_SCHEDULE_PROGRESS_EVERY === 0 ||
            completed === total)
        ) {
          logAuthPhase('reup-schedule-batch-progress', {
            completed,
            total,
          });
        }

        return row;
      });

      const out: ReupScheduleBatchResult['jobs'] = rows;
      logAuthPhase('reup-schedule-batch-done', {
        total,
        ok: out.filter((j) => j.ok === true).length,
        err: out.filter((j) => j.ok === false).length,
      });
      return { jobs: out };
    },
  );
}
