export const DEFAULT_OPENROUTER_MODEL_ID = 'openai/gpt-4o-mini';

export type OpenRouterModelOption = {
  id: string;
  name: string;
};

export type OpenRouterPublicSettings = {
  modelId: string;
  hasApiKey: boolean;
};

export type OpenRouterSetPayload = {
  modelId?: string;
  /** Chỉ gửi khi người dùng nhập key mới (không gửi khi để trống = giữ key cũ). */
  apiKey?: string;
  clearApiKey?: boolean;
};

export type ListOpenRouterModelsResult =
  | { ok: true; models: OpenRouterModelOption[] }
  | { ok: false; message: string };

export type ContentPromptPublicSettings = {
  prompt: string;
  hasPrompt: boolean;
};

export type ContentPromptSetPayload = {
  prompt?: string;
  clearPrompt?: boolean;
};

/** Góc đặt watermark / logo trên khung hình. */
export type ReupOverlayPosition = 'tl' | 'tr' | 'bl' | 'br' | 'center';

export type ReupRemixPublicSettings = {
  /** Bật pipeline: tải MP4 → FFmpeg → upload multipart `source`. */
  enabled: boolean;
  /** Lật ngang (mirror). */
  hflip: boolean;
  /** Độ sáng FFmpeg `eq`, khoảng -0.35 … 0.35 (0 = giữ nguyên). */
  brightness: number;
  /** Độ bão hòa `eq`, khoảng 0.6 … 1.6 (1 = giữ nguyên). */
  saturation: number;
  /**
   * Tốc độ phát sau remix (1 = gốc). FFmpeg: `setpts` (video) + `atempo` (âm thanh nếu giữ).
   * Khuyến nghị 0.25 … 4.
   */
  playbackSpeed: number;
  /**
   * Chiều rộng logo sau scale (px), tương ứng `scale=W:-1` trong FFmpeg (mặc định 120).
   */
  logoWidthPx: number;
  /**
   * Hệ số cỡ chữ watermark so với mặc định `h/32` (1 = như cũ).
   */
  watermarkFontScale: number;
  /**
   * Cứ mỗi N giây, bỏ đoạn đầu M giây (0 = tắt).
   * Ví dụ 5 + 0.15 ≈ cắt nhịp nhẹ tránh fingerprint.
   */
  jumpEverySeconds: number;
  jumpSkipSeconds: number;
  /** Text chìm (watermark). */
  watermarkText: string;
  /** 0 … 1 */
  watermarkOpacity: number;
  watermarkPosition: ReupOverlayPosition;
  watermarkAnimate: boolean;
  /** Đường dẫn file ảnh logo (PNG khuyến nghị). */
  logoPath: string;
  /** 0 … 1 */
  logoOpacity: number;
  logoPosition: ReupOverlayPosition;
  logoAnimate: boolean;
  /**
   * Chroma key (màu trong suốt) — hex 6 ký tự không #, ví dụ 00FF00.
   * Để trống = tắt. Cần FFmpeg hỗ trợ `chromakey`.
   */
  chromaKeyHex: string;
  chromaKeySimilarity: number;
  chromaKeyBlend: number;
  audioMode: 'keep' | 'mute';
};

export const DEFAULT_REUP_REMIX_SETTINGS: ReupRemixPublicSettings = {
  enabled: false,
  hflip: false,
  brightness: 0,
  saturation: 1,
  playbackSpeed: 1,
  logoWidthPx: 120,
  watermarkFontScale: 1,
  jumpEverySeconds: 0,
  jumpSkipSeconds: 0.15,
  watermarkText: '',
  watermarkOpacity: 0.35,
  watermarkPosition: 'br',
  watermarkAnimate: true,
  logoPath: '',
  logoOpacity: 0.85,
  logoPosition: 'tr',
  logoAnimate: false,
  chromaKeyHex: '',
  chromaKeySimilarity: 0.12,
  chromaKeyBlend: 0.08,
  audioMode: 'keep',
};

export type ReupRemixSetPayload = Partial<ReupRemixPublicSettings>;
