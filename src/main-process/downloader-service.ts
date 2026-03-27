import { spawn, type ChildProcess } from 'node:child_process';
import { app } from 'electron';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import type {
  VideoInfoResult,
  VideoInfoError,
  VideoInfoItem,
  DownloadProgressPayload,
  DownloadRequest,
} from '../shared/downloader-types';

let defaultOutputDir: string | null = null;
const activeProcesses = new Map<string, ChildProcess>();

function getYtDlpBin(): string {
  return 'yt-dlp';
}

function getOutputDir(): string {
  if (defaultOutputDir) return defaultOutputDir;
  const dir = path.join(app.getPath('downloads'), 'okfanpage-downloads');
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function setOutputDir(dir: string): void {
  defaultOutputDir = dir;
}

export function getDownloadOutputDir(): string {
  return getOutputDir();
}

export async function checkYtDlp(): Promise<{ ok: boolean; version?: string; message?: string }> {
  return new Promise((resolve) => {
    try {
      const proc = spawn(getYtDlpBin(), ['--version']);
      let out = '';
      proc.stdout.on('data', (d) => { out += d.toString(); });
      proc.on('error', () => {
        resolve({
          ok: false,
          message: 'Không tìm thấy yt-dlp. Cài yt-dlp: pip install yt-dlp hoặc brew install yt-dlp',
        });
      });
      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ ok: true, version: out.trim() });
        } else {
          resolve({ ok: false, message: `yt-dlp thoát với code ${code}` });
        }
      });
    } catch {
      resolve({ ok: false, message: 'Không thể chạy yt-dlp.' });
    }
  });
}

export async function fetchVideoInfo(url: string): Promise<VideoInfoItem> {
  return new Promise((resolve) => {
    const args = [
      url,
      '--dump-json',
      '--no-download',
      '--no-playlist',
      '--no-warnings',
    ];

    try {
      const proc = spawn(getYtDlpBin(), args);
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (d) => { stdout += d.toString(); });
      proc.stderr.on('data', (d) => { stderr += d.toString(); });

      proc.on('error', () => {
        resolve({ ok: false, url, message: 'Không chạy được yt-dlp.' } satisfies VideoInfoError);
      });

      proc.on('close', (code) => {
        if (code === 0 && stdout.trim()) {
          try {
            const info = JSON.parse(stdout);
            const result: VideoInfoResult = {
              ok: true,
              id: info.id ?? url,
              url: info.webpage_url ?? url,
              title: info.title ?? 'Không rõ tiêu đề',
              duration: info.duration ?? null,
              thumbnail: info.thumbnail ?? null,
              uploader: info.uploader ?? info.channel ?? null,
              extractor: info.extractor ?? null,
              resolution: info.resolution ?? null,
              filesize_approx: info.filesize_approx ?? null,
            };
            resolve(result);
          } catch {
            resolve({ ok: false, url, message: 'Không phân tích được JSON từ yt-dlp.' });
          }
        } else {
          const msg = stderr.trim() || `yt-dlp thoát code ${code}`;
          resolve({ ok: false, url, message: msg });
        }
      });
    } catch {
      resolve({ ok: false, url, message: 'Không thể khởi chạy yt-dlp.' });
    }
  });
}

export function startDownload(
  req: DownloadRequest,
  onProgress: (payload: DownloadProgressPayload) => void,
): void {
  const outDir = getOutputDir();
  mkdirSync(outDir, { recursive: true });

  const outtmpl = path.join(outDir, '%(title)s.%(ext)s');

  const args = [
    req.url,
    '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best',
    '--merge-output-format', 'mp4',
    '-o', outtmpl,
    '--no-playlist',
    '--newline',
    '--progress-template', '%(progress._percent_str)s|||%(progress._speed_str)s|||%(progress._eta_str)s',
  ];

  try {
    const proc = spawn(getYtDlpBin(), args);
    activeProcesses.set(req.id, proc);

    let lastFilePath = '';

    proc.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;

        if (line.includes('[Merger]') || line.includes('[ffmpeg]') || line.includes('Merging formats')) {
          onProgress({
            id: req.id,
            status: 'merging',
            percent: 99,
            speed: null,
            eta: null,
          });
          continue;
        }

        if (line.includes('[download] Destination:')) {
          lastFilePath = line.replace('[download] Destination:', '').trim();
          continue;
        }

        if (line.includes('has already been downloaded')) {
          const match = line.match(/^\[download\]\s+(.+?)\s+has already been downloaded/);
          lastFilePath = match?.[1] ?? lastFilePath;
          onProgress({
            id: req.id,
            status: 'done',
            percent: 100,
            speed: null,
            eta: null,
            filePath: lastFilePath,
          });
          continue;
        }

        const parts = line.split('|||');
        if (parts.length === 3) {
          const pctStr = parts[0].replace('%', '').trim();
          const pct = parseFloat(pctStr);
          if (!isNaN(pct)) {
            onProgress({
              id: req.id,
              status: 'downloading',
              percent: Math.min(pct, 99),
              speed: parts[1]?.trim() || null,
              eta: parts[2]?.trim() || null,
            });
          }
        }
      }
    });

    proc.stderr.on('data', (data) => {
      const line = data.toString().trim();
      if (line.includes('WARNING')) return;
      if (line.includes('ERROR')) {
        onProgress({
          id: req.id,
          status: 'error',
          percent: 0,
          speed: null,
          eta: null,
          message: line,
        });
      }
    });

    proc.on('error', () => {
      activeProcesses.delete(req.id);
      onProgress({
        id: req.id,
        status: 'error',
        percent: 0,
        speed: null,
        eta: null,
        message: 'Không chạy được yt-dlp.',
      });
    });

    proc.on('close', (code) => {
      activeProcesses.delete(req.id);
      if (code === 0) {
        onProgress({
          id: req.id,
          status: 'done',
          percent: 100,
          speed: null,
          eta: null,
          filePath: lastFilePath || undefined,
        });
      }
    });
  } catch {
    onProgress({
      id: req.id,
      status: 'error',
      percent: 0,
      speed: null,
      eta: null,
      message: 'Không thể khởi chạy yt-dlp.',
    });
  }
}

export function cancelDownload(id: string): boolean {
  const proc = activeProcesses.get(id);
  if (proc) {
    proc.kill('SIGTERM');
    activeProcesses.delete(id);
    return true;
  }
  return false;
}
