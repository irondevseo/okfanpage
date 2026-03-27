import type {
  VideoInfoItem,
  DownloadProgressPayload,
  DownloadRequest,
  DownloadStartResult,
} from '../shared/downloader-types';

function api() {
  if (typeof window === 'undefined' || !window.electronAPI) {
    throw new Error('Chỉ chạy trong Electron.');
  }
  return window.electronAPI;
}

export async function downloaderCheckYtDlp(): Promise<{ ok: boolean; version?: string; message?: string }> {
  return api().downloader.checkYtDlp();
}

export async function downloaderFetchInfo(url: string): Promise<VideoInfoItem> {
  return api().downloader.fetchInfo(url);
}

export async function downloaderStartDownload(req: DownloadRequest): Promise<DownloadStartResult> {
  return api().downloader.startDownload(req);
}

export async function downloaderCancel(id: string): Promise<boolean> {
  return api().downloader.cancel(id);
}

export async function downloaderPickOutputDir(): Promise<string | null> {
  return api().downloader.pickOutputDir();
}

export async function downloaderGetOutputDir(): Promise<string> {
  return api().downloader.getOutputDir();
}

export async function downloaderOpenOutputDir(): Promise<void> {
  return api().downloader.openOutputDir();
}

export function subscribeDownloaderProgress(
  onProgress: (payload: DownloadProgressPayload) => void,
): () => void {
  return api().downloader.onProgress(onProgress);
}
