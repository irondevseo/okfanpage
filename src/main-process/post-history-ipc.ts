import { ipcMain } from 'electron';
import type {
  PostHistoryFilter,
  PostHistoryListResult,
  PostHistoryStats,
} from '../shared/post-history-types';
import {
  listPostHistory,
  getPostHistoryStats,
  deletePostHistoryEntry,
  clearPostHistory,
  autoPromoteScheduled,
} from './post-history-store';

export function registerPostHistoryIpc(): void {
  ipcMain.handle(
    'postHistory:list',
    async (_e, filter: PostHistoryFilter): Promise<PostHistoryListResult> => {
      autoPromoteScheduled();
      const result = listPostHistory(filter);
      return { ok: true, ...result };
    },
  );

  ipcMain.handle(
    'postHistory:stats',
    async (): Promise<PostHistoryStats> => {
      autoPromoteScheduled();
      return getPostHistoryStats();
    },
  );

  ipcMain.handle(
    'postHistory:delete',
    async (_e, id: string): Promise<boolean> => {
      return deletePostHistoryEntry(id);
    },
  );

  ipcMain.handle(
    'postHistory:clear',
    async (_e, pageId?: string): Promise<number> => {
      return clearPostHistory(pageId);
    },
  );
}
