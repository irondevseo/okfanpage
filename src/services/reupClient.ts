import type {
  ReupFetchSourcesResult,
  ReupRewriteResult,
  ReupScheduleBatchResult,
  ReupScheduleJobPayload,
} from '../shared/reup-types';

function api() {
  if (typeof window === 'undefined' || !window.electronAPI) {
    throw new Error('Chỉ chạy trong Electron.');
  }
  return window.electronAPI;
}

export async function reupFetchSources(text: string): Promise<ReupFetchSourcesResult> {
  return api().reup.fetchSources(text);
}

export async function reupRewriteCaptions(
  items: { key: string; text: string }[],
): Promise<ReupRewriteResult> {
  return api().reup.rewriteCaptions(items);
}

export async function reupScheduleVideos(
  jobs: ReupScheduleJobPayload[],
): Promise<ReupScheduleBatchResult> {
  return api().reup.scheduleVideos(jobs);
}
