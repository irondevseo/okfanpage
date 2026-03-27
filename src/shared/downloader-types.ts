export interface VideoInfoResult {
  ok: true;
  id: string;
  url: string;
  title: string;
  duration: number | null;
  thumbnail: string | null;
  uploader: string | null;
  extractor: string | null;
  resolution: string | null;
  filesize_approx: number | null;
}

export interface VideoInfoError {
  ok: false;
  url: string;
  message: string;
}

export type VideoInfoItem = VideoInfoResult | VideoInfoError;

export interface DownloadProgressPayload {
  id: string;
  status: 'downloading' | 'merging' | 'done' | 'error';
  percent: number;
  speed: string | null;
  eta: string | null;
  message?: string;
  filePath?: string;
}

export interface DownloadRequest {
  id: string;
  url: string;
  title: string;
}

export interface DownloadStartResult {
  ok: boolean;
  message?: string;
}
