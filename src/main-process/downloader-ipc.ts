import { dialog, ipcMain, shell } from 'electron';
import type {
  VideoInfoItem,
  DownloadProgressPayload,
  DownloadRequest,
  DownloadStartResult,
} from '../shared/downloader-types';
import {
  checkYtDlp,
  fetchVideoInfo,
  startDownload,
  cancelDownload,
  setOutputDir,
  getDownloadOutputDir,
} from './downloader-service';

export function registerDownloaderIpc(): void {
  ipcMain.handle(
    'downloader:checkYtDlp',
    async (): Promise<{ ok: boolean; version?: string; message?: string }> => {
      return checkYtDlp();
    },
  );

  ipcMain.handle(
    'downloader:fetchInfo',
    async (_e, url: string): Promise<VideoInfoItem> => {
      return fetchVideoInfo(url);
    },
  );

  ipcMain.handle(
    'downloader:startDownload',
    async (e, req: DownloadRequest): Promise<DownloadStartResult> => {
      try {
        startDownload(req, (payload: DownloadProgressPayload) => {
          if (!e.sender.isDestroyed()) {
            e.sender.send('downloader:progress', payload);
          }
        });
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Không thể bắt đầu tải.',
        };
      }
    },
  );

  ipcMain.handle(
    'downloader:cancel',
    async (_e, id: string): Promise<boolean> => {
      return cancelDownload(id);
    },
  );

  ipcMain.handle(
    'downloader:pickOutputDir',
    async (): Promise<string | null> => {
      const result = await dialog.showOpenDialog({
        title: 'Chọn thư mục lưu video',
        defaultPath: getDownloadOutputDir(),
        properties: ['openDirectory', 'createDirectory'],
      });
      if (result.canceled || !result.filePaths[0]) return null;
      setOutputDir(result.filePaths[0]);
      return result.filePaths[0];
    },
  );

  ipcMain.handle(
    'downloader:getOutputDir',
    async (): Promise<string> => {
      return getDownloadOutputDir();
    },
  );

  ipcMain.handle(
    'downloader:openOutputDir',
    async (): Promise<void> => {
      shell.openPath(getDownloadOutputDir());
    },
  );
}
