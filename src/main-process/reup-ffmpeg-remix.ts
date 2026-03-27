import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import ffmpegStatic from 'ffmpeg-static';
import type { ReupOverlayPosition, ReupRemixPublicSettings } from '../shared/settings-types';

function getFfmpegPath(): string {
  if (!ffmpegStatic) {
    throw new Error(
      'Không tìm thấy binary FFmpeg (ffmpeg-static). Cài lại dependencies hoặc kiểm tra bản build.',
    );
  }
  return ffmpegStatic;
}

/**
 * Đường dẫn trong drawtext (textfile / fontfile): quote + escape `:` sau ổ Windows.
 */
function pathForDrawtextFilterOption(absPath: string): string {
  let n = absPath.replace(/\\/g, '/');
  if (/^[A-Za-z]:/.test(n)) {
    n = n.replace(/^([A-Za-z]):/, '$1\\:');
  }
  return `'${n.replace(/'/g, "\\'")}'`;
}

/**
 * Font có đủ glyph tiếng Việt; drawtext mặc định của FFmpeg thường thiếu → ô vuông (tofu).
 */
function resolveDrawtextFontfile(): string | undefined {
  const plat = platform();
  const candidates: string[] = [];

  if (plat === 'darwin') {
    candidates.push(
      '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
      '/Library/Fonts/Arial Unicode.ttf',
      '/System/Library/Fonts/Supplemental/Arial.ttf',
      '/System/Library/Fonts/Supplemental/Times New Roman.ttf',
      '/System/Library/Fonts/Supplemental/Verdana.ttf',
      '/System/Library/Fonts/Supplemental/Tahoma.ttf',
    );
  } else if (plat === 'win32') {
    const windir = process.env.WINDIR || 'C:\\Windows';
    candidates.push(
      `${windir}\\Fonts\\arial.ttf`,
      `${windir}\\Fonts\\segoeui.ttf`,
      `${windir}\\Fonts\\tahoma.ttf`,
      `${windir}\\Fonts\\times.ttf`,
    );
  } else {
    candidates.push(
      '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
      '/usr/share/fonts/opentype/noto/NotoSans-Regular.ttf',
      '/usr/local/share/fonts/NotoSans-Regular.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      '/usr/share/fonts/TTF/DejaVuSans.ttf',
    );
  }

  for (const p of candidates) {
    if (existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

function overlayStaticExpr(pos: ReupOverlayPosition): { x: string; y: string } {
  switch (pos) {
    case 'tl':
      return { x: '10', y: '10' };
    case 'tr':
      return { x: 'W-w-10', y: '10' };
    case 'bl':
      return { x: '10', y: 'H-h-10' };
    case 'br':
      return { x: 'W-w-10', y: 'H-h-10' };
    case 'center':
    default:
      return { x: '(W-w)/2', y: '(H-h)/2' };
  }
}

/**
 * Chuyển động theo chữ X trong khung: nửa chu kỳ TL↔BR, nửa kế TR↔BL (mỗi đường chéo ~P giây ping-pong).
 * Khi bật, vị trí tĩnh (góc) không áp dụng — watermark/logo đi full chéo có margin 10px.
 */
function overlayDiagonalCrossExpr(): { x: string; y: string } {
  const P = 8;
  const twoP = 16;
  const pA = `0.5+0.5*sin(2*PI*mod(t\\,${P})/${P}-PI/2)`;
  const pB = `0.5+0.5*sin(2*PI*(mod(t\\,${twoP})-${P})/${P}-PI/2)`;
  const xA = `10+(W-w-20)*(${pA})`;
  const yA = `10+(H-h-20)*(${pA})`;
  const xB = `(W-w-10)-(W-w-20)*(${pB})`;
  const yB = `10+(H-h-20)*(${pB})`;
  return {
    x: `if(lt(mod(t\\,${twoP})\\,${P})\\,${xA}\\,${xB})`,
    y: `if(lt(mod(t\\,${twoP})\\,${P})\\,${yA}\\,${yB})`,
  };
}

/** Chuỗi filter `atempo=…` (có thể nối bằng dấu phẩy), giới hạn FFmpeg 0.5–2 mỗi bước. */
function buildAtempoChain(speed: number): string | null {
  let tempo = Math.max(0.25, Math.min(4, speed));
  if (Math.abs(tempo - 1) < 0.001) {
    return null;
  }
  const parts: string[] = [];
  while (tempo < 0.5 - 1e-9) {
    parts.push('atempo=0.5');
    tempo /= 0.5;
  }
  while (tempo > 2 + 1e-9) {
    parts.push('atempo=2.0');
    tempo /= 2;
  }
  if (Math.abs(tempo - 1) > 0.001) {
    parts.push(`atempo=${Number(tempo.toFixed(5))}`);
  }
  return parts.length ? parts.join(',') : null;
}

/**
 * Xây filter_complex + chạy FFmpeg. Không ghi đè `inputPath`.
 */
export async function remixVideoWithFfmpeg(
  inputPath: string,
  outputPath: string,
  cfg: ReupRemixPublicSettings,
): Promise<void> {
  const ffmpeg = getFfmpegPath();
  const logoFsPath = (cfg.logoPath ?? '').trim();
  const hasLogo = Boolean(logoFsPath) && existsSync(logoFsPath);

  const jumpEvery = Math.max(0, cfg.jumpEverySeconds);
  const jumpSkip = Math.max(0, cfg.jumpSkipSeconds);
  const useJump =
    jumpEvery > 0 && jumpSkip > 0 && jumpSkip + 0.001 < jumpEvery;

  const playbackSpeed = Math.max(
    0.25,
    Math.min(4, Number(cfg.playbackSpeed) || 1),
  );
  const logoWidthPx = Math.max(
    32,
    Math.min(640, Math.round(Number(cfg.logoWidthPx) || 120)),
  );
  const watermarkFontScale = Math.max(
    0.25,
    Math.min(4, Number(cfg.watermarkFontScale) || 1),
  );
  const fontExpr = `h*${(watermarkFontScale / 32).toFixed(8)}`;

  let wmTempPath: string | undefined;

  try {
    const parts: string[] = [
      'scale=w=min(iw\\,1920):h=-2',
      'setsar=1',
    ];

    if (useJump) {
      parts.push(
        `select='not(between(mod(t\\,${jumpEvery})\\,0\\,${jumpSkip}))'`,
      );
      parts.push('setpts=PTS-STARTPTS');
    }

    const b = Math.max(-0.35, Math.min(0.35, cfg.brightness));
    const sat = Math.max(0.6, Math.min(1.6, cfg.saturation));
    if (Math.abs(b) > 0.001 || Math.abs(sat - 1) > 0.001) {
      parts.push(`eq=brightness=${b}:saturation=${sat}`);
    }

    if (cfg.hflip) {
      parts.push('hflip');
    }

    const wm = (cfg.watermarkText ?? '').trim();
    const wmAlpha = Math.max(0, Math.min(1, cfg.watermarkOpacity));
    if (wm) {
      wmTempPath = `${outputPath}.okfanpage-wm.txt`;
      writeFileSync(wmTempPath, wm, 'utf8');
      const pos = cfg.watermarkAnimate
        ? overlayDiagonalCrossExpr()
        : overlayStaticExpr(cfg.watermarkPosition);
      const fontPath = resolveDrawtextFontfile();
      const fontOpt = fontPath
        ? `fontfile=${pathForDrawtextFilterOption(fontPath)}:`
        : '';
      parts.push(
        `drawtext=${fontOpt}textfile=${pathForDrawtextFilterOption(wmTempPath)}:fontsize=${fontExpr}:fontcolor=white@${wmAlpha}:x=${pos.x}:y=${pos.y}:box=1:boxcolor=black@${Math.min(0.45, wmAlpha + 0.15)}:boxborderw=4`,
      );
    }

    let filterComplex: string;
    let mapVideo: string;

    if (hasLogo) {
      const op = Math.max(0, Math.min(1, cfg.logoOpacity));
      const pos = cfg.logoAnimate
        ? overlayDiagonalCrossExpr()
        : overlayStaticExpr(cfg.logoPosition);
      const vChain = `[0:v]${parts.join(',')}[vpre]`;
      filterComplex =
        `${vChain};` +
        `[1:v]scale=${logoWidthPx}:-1,format=rgba,colorchannelmixer=aa=${op}[lg];` +
        `[vpre][lg]overlay=x=${pos.x}:y=${pos.y}:shortest=1:format=auto[vfinal]`;
    } else {
      filterComplex = `[0:v]${parts.join(',')}[vfinal]`;
    }

    if (Math.abs(playbackSpeed - 1) > 0.001) {
      filterComplex += `;[vfinal]setpts=PTS/${Number(playbackSpeed.toFixed(6))}[voutv]`;
      mapVideo = '[voutv]';
    } else {
      mapVideo = '[vfinal]';
    }

    const atempoChain = buildAtempoChain(playbackSpeed);
    const audioSegs: string[] = [];
    if (cfg.audioMode === 'keep') {
      if (useJump) {
        audioSegs.push(
          `aselect='not(between(mod(t\\,${jumpEvery})\\,0\\,${jumpSkip}))'`,
          'asetpts=PTS-STARTPTS',
        );
      }
      if (atempoChain) {
        audioSegs.push(atempoChain);
      }
      if (audioSegs.length > 0) {
        filterComplex += `;[0:a]${audioSegs.join(',')}[aout]`;
      }
    }

    const args: string[] = [
      '-hide_banner',
      '-loglevel',
      'warning',
      '-y',
      '-i',
      inputPath,
    ];
    if (hasLogo) {
      args.push('-loop', '1', '-i', logoFsPath);
    }
    args.push('-filter_complex', filterComplex);
    args.push('-map', mapVideo);

    if (cfg.audioMode === 'mute') {
      args.push('-an');
    } else if (audioSegs.length > 0) {
      args.push('-map', '[aout]');
    } else {
      args.push('-map', '0:a?');
    }

    args.push(
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
    );
    if (cfg.audioMode !== 'mute' && audioSegs.length === 0) {
      args.push('-c:a', 'copy');
    } else if (cfg.audioMode === 'keep' && audioSegs.length > 0) {
      args.push('-c:a', 'aac', '-b:a', '128k');
    }

    args.push('-shortest', outputPath);

    await runFfmpeg(ffmpeg, args);
  } finally {
    if (wmTempPath) {
      try {
        unlinkSync(wmTempPath);
      } catch {
        /* ignore */
      }
    }
  }
}

function runFfmpeg(bin: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    let errBuf = '';
    child.stderr?.on('data', (c: Buffer) => {
      errBuf += c.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `FFmpeg thoát mã ${code}. ${errBuf.trim().slice(-1800) || 'Không có log.'}`,
        ),
      );
    });
  });
}
