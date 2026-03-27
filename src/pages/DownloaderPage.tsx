import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  VideoInfoItem,
  VideoInfoResult,
  DownloadProgressPayload,
} from '../shared/downloader-types';
import {
  downloaderCheckYtDlp,
  downloaderFetchInfo,
  downloaderStartDownload,
  downloaderCancel,
  downloaderPickOutputDir,
  downloaderGetOutputDir,
  downloaderOpenOutputDir,
  subscribeDownloaderProgress,
} from '../services/downloaderClient';

interface DownloadState {
  status: 'idle' | 'downloading' | 'merging' | 'done' | 'error' | 'cancelled';
  percent: number;
  speed: string | null;
  eta: string | null;
  message?: string;
  filePath?: string;
}

function formatDuration(sec: number | null): string {
  if (sec == null || sec <= 0) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatBytes(bytes: number | null): string {
  if (bytes == null || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function DownloaderPage() {
  const [ytdlpOk, setYtdlpOk] = useState<boolean | null>(null);
  const [ytdlpMsg, setYtdlpMsg] = useState('');
  const [urlsText, setUrlsText] = useState('');
  const [fetching, setFetching] = useState(false);
  const [videos, setVideos] = useState<VideoInfoItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloads, setDownloads] = useState<Map<string, DownloadState>>(new Map());
  const [outputDir, setOutputDir] = useState('');
  const fetchAbortRef = useRef(false);

  useEffect(() => {
    downloaderCheckYtDlp().then((r) => {
      setYtdlpOk(r.ok);
      setYtdlpMsg(r.ok ? `yt-dlp ${r.version}` : r.message ?? '');
    });
    downloaderGetOutputDir().then(setOutputDir);
  }, []);

  useEffect(() => {
    const unsub = subscribeDownloaderProgress((p: DownloadProgressPayload) => {
      setDownloads((prev) => {
        const next = new Map(prev);
        const cur = next.get(p.id);
        if (cur?.status === 'cancelled') return prev;
        next.set(p.id, {
          status: p.status,
          percent: p.percent,
          speed: p.speed,
          eta: p.eta,
          message: p.message,
          filePath: p.filePath,
        });
        return next;
      });
    });
    return unsub;
  }, []);

  const onFetchInfo = useCallback(async () => {
    const urls = urlsText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.startsWith('http://') || u.startsWith('https://')));

    if (urls.length === 0) return;

    setFetching(true);
    setVideos([]);
    setSelected(new Set());
    fetchAbortRef.current = false;

    for (const url of urls) {
      if (fetchAbortRef.current) break;
      const info = await downloaderFetchInfo(url);
      setVideos((prev) => [...prev, info]);
      if (info.ok) {
        setSelected((prev) => new Set(prev).add(info.id));
      }
    }

    setFetching(false);
  }, [urlsText]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    const okVideos = videos.filter((v): v is VideoInfoResult => v.ok);
    setSelected((prev) => {
      if (prev.size === okVideos.length) return new Set();
      return new Set(okVideos.map((v) => v.id));
    });
  }, [videos]);

  const onDownloadOne = useCallback(async (v: VideoInfoResult) => {
    setDownloads((prev) => {
      const next = new Map(prev);
      next.set(v.id, { status: 'downloading', percent: 0, speed: null, eta: null });
      return next;
    });
    await downloaderStartDownload({ id: v.id, url: v.url, title: v.title });
  }, []);

  const onDownloadSelected = useCallback(async () => {
    const okVideos = videos.filter(
      (v): v is VideoInfoResult => v.ok && selected.has(v.id),
    );
    for (const v of okVideos) {
      const dl = downloads.get(v.id);
      if (dl && (dl.status === 'downloading' || dl.status === 'merging' || dl.status === 'done')) {
        continue;
      }
      await onDownloadOne(v);
    }
  }, [videos, selected, downloads, onDownloadOne]);

  const onCancelDownload = useCallback(async (id: string) => {
    await downloaderCancel(id);
    setDownloads((prev) => {
      const next = new Map(prev);
      next.set(id, { status: 'cancelled', percent: 0, speed: null, eta: null, message: 'Đã hủy' });
      return next;
    });
  }, []);

  const onPickDir = useCallback(async () => {
    const dir = await downloaderPickOutputDir();
    if (dir) setOutputDir(dir);
  }, []);

  const okVideos = videos.filter((v): v is VideoInfoResult => v.ok);

  if (ytdlpOk === false) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 py-16 text-center">
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-6 py-5">
          <h2 className="mb-2 text-lg font-semibold text-red-300">yt-dlp chưa được cài đặt</h2>
          <p className="text-sm text-red-200/80">{ytdlpMsg}</p>
          <p className="mt-3 text-xs text-slate-400">
            Cài đặt: <code className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">pip install yt-dlp</code> hoặc{' '}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">brew install yt-dlp</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 overflow-y-auto pb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">Tải video</h1>
          {ytdlpOk && (
            <p className="text-xs text-slate-500">{ytdlpMsg}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPickDir}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
          >
            Thư mục lưu
          </button>
          <button
            type="button"
            onClick={() => void downloaderOpenOutputDir()}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
          >
            Mở thư mục
          </button>
        </div>
      </div>

      {outputDir && (
        <p className="truncate text-xs text-slate-500">
          Lưu vào: <span className="text-slate-400">{outputDir}</span>
        </p>
      )}

      {/* URL input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">
          Dán link video (mỗi dòng một link)
        </label>
        <textarea
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          placeholder={
            'https://www.youtube.com/watch?v=...\nhttps://www.tiktok.com/@user/video/...\nhttps://www.facebook.com/watch/?v=...'
          }
          rows={5}
          className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none ring-blue-500/40 transition focus:border-blue-500 focus:ring-2"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onFetchInfo()}
            disabled={fetching || !urlsText.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {fetching ? 'Đang lấy thông tin…' : 'Lấy thông tin video'}
          </button>
          {fetching && (
            <button
              type="button"
              onClick={() => { fetchAbortRef.current = true; }}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Dừng
            </button>
          )}
          {fetching && (
            <span className="text-xs text-slate-500">
              {videos.length} / {urlsText.split('\n').filter((u) => u.trim().startsWith('http')).length}
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {videos.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-white">
                Kết quả ({okVideos.length} video)
              </h2>
              {okVideos.length > 1 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-blue-400 transition hover:text-blue-300"
                >
                  {selected.size === okVideos.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              )}
            </div>
            {selected.size > 0 && (
              <button
                type="button"
                onClick={() => void onDownloadSelected()}
                className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-green-500"
              >
                Tải {selected.size} video đã chọn
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {videos.map((v, idx) => {
              if (v.ok === false) {
                const errItem = v;
                return (
                  <div
                    key={`err-${idx}`}
                    className="rounded-lg border border-red-500/20 bg-red-950/20 px-4 py-3"
                  >
                    <p className="truncate text-xs text-red-300">{errItem.url}</p>
                    <p className="mt-1 text-xs text-red-400/80">{errItem.message}</p>
                  </div>
                );
              }

              const dl = downloads.get(v.id);

              return (
                <div
                  key={v.id}
                  className="group relative flex gap-3 rounded-lg border border-slate-700/60 bg-slate-800/40 p-3 transition hover:border-slate-600"
                >
                  {/* Checkbox */}
                  <div className="flex items-start pt-1">
                    <input
                      type="checkbox"
                      checked={selected.has(v.id)}
                      onChange={() => toggleSelect(v.id)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/30"
                    />
                  </div>

                  {/* Thumbnail */}
                  {v.thumbnail && (
                    <div className="flex-shrink-0">
                      <img
                        src={v.thumbnail}
                        alt=""
                        className="h-16 w-28 rounded object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{v.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                      {v.uploader && <span>{v.uploader}</span>}
                      {v.extractor && (
                        <span className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
                          {v.extractor}
                        </span>
                      )}
                      <span>{formatDuration(v.duration)}</span>
                      {v.resolution && <span>{v.resolution}</span>}
                      {v.filesize_approx != null && v.filesize_approx > 0 && (
                        <span>~{formatBytes(v.filesize_approx)}</span>
                      )}
                    </div>

                    {/* Download progress */}
                    {dl && (
                      <div className="mt-2">
                        {(dl.status === 'downloading' || dl.status === 'merging') && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${dl.percent}%` }}
                              />
                            </div>
                            <span className="min-w-[3rem] text-right text-xs text-slate-400">
                              {dl.status === 'merging' ? 'Merging…' : `${dl.percent.toFixed(1)}%`}
                            </span>
                            {dl.speed && (
                              <span className="text-xs text-slate-500">{dl.speed}</span>
                            )}
                            {dl.eta && dl.eta !== 'N/A' && (
                              <span className="text-xs text-slate-500">ETA {dl.eta}</span>
                            )}
                          </div>
                        )}
                        {dl.status === 'done' && (
                          <p className="text-xs font-medium text-green-400">Tải xong</p>
                        )}
                        {dl.status === 'error' && (
                          <p className="text-xs text-red-400">{dl.message || 'Lỗi tải'}</p>
                        )}
                        {dl.status === 'cancelled' && (
                          <p className="text-xs text-yellow-400">Đã hủy</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    {(!dl || dl.status === 'idle' || dl.status === 'error' || dl.status === 'cancelled') && (
                      <button
                        type="button"
                        onClick={() => void onDownloadOne(v)}
                        className="rounded-md bg-blue-600/80 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-500"
                      >
                        Tải
                      </button>
                    )}
                    {(dl?.status === 'downloading' || dl?.status === 'merging') && (
                      <button
                        type="button"
                        onClick={() => void onCancelDownload(v.id)}
                        className="rounded-md border border-red-500/40 px-3 py-1 text-xs font-medium text-red-400 transition hover:bg-red-950/40"
                      >
                        Hủy
                      </button>
                    )}
                    {dl?.status === 'done' && (
                      <button
                        type="button"
                        onClick={() => void onDownloadOne(v)}
                        className="rounded-md border border-slate-600 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                      >
                        Tải lại
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
