import type {
  PostHistoryFilter,
  PostHistoryListResult,
  PostHistoryStats,
} from '../shared/post-history-types';

function api() {
  if (typeof window === 'undefined' || !window.electronAPI) {
    throw new Error('Chỉ chạy trong Electron.');
  }
  return window.electronAPI;
}

export async function postHistoryList(filter: PostHistoryFilter): Promise<PostHistoryListResult> {
  return api().postHistory.list(filter);
}

export async function postHistoryStats(): Promise<PostHistoryStats> {
  return api().postHistory.stats();
}

export async function postHistoryDelete(id: string): Promise<boolean> {
  return api().postHistory.delete(id);
}

export async function postHistoryClear(pageId?: string): Promise<number> {
  return api().postHistory.clear(pageId);
}
