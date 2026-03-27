import type { CompetitorPostCompact } from '../shared/competitor-analysis-types';

const DEFAULT_MAX_CAPTION_CHARS = 6_000;

type RawAttachment = {
  media_type?: string;
  media?: {
    image?: {
      src?: string;
      height?: number;
      width?: number;
    };
  };
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function parseAttachments(raw: unknown): {
  mediaTypes: string[];
  attachmentImageSrcs: string[];
} {
  const root = asRecord(raw);
  const data = root?.data;
  if (!Array.isArray(data)) {
    return { mediaTypes: [], attachmentImageSrcs: [] };
  }
  const mediaTypes: string[] = [];
  const attachmentImageSrcs: string[] = [];
  for (const item of data) {
    const a = item as RawAttachment;
    if (typeof a.media_type === 'string' && a.media_type.length > 0) {
      mediaTypes.push(a.media_type);
    }
    const src = a.media?.image?.src;
    if (typeof src === 'string' && src.length > 0) {
      attachmentImageSrcs.push(src);
    }
  }
  return { mediaTypes, attachmentImageSrcs };
}

function parseComments(raw: unknown): { texts: string[]; totalFromGraph: number } {
  const root = asRecord(raw);
  const data = root?.data;
  if (!Array.isArray(data)) {
    return { texts: [], totalFromGraph: 0 };
  }
  const texts: string[] = [];
  for (const c of data) {
    const msg = asRecord(c)?.message;
    if (typeof msg === 'string' && msg.trim().length > 0) {
      texts.push(msg.trim());
    }
  }
  return { texts, totalFromGraph: data.length };
}

/**
 * Gộp URL cho AI: thumbnail ảnh/video từ `media.image.src`, sau đó `full_picture` nếu chưa trùng.
 */
export function buildImageUrlsForAi(
  attachmentImageSrcs: string[],
  fullPicture: string | null,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of attachmentImageSrcs) {
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }
  if (fullPicture && !seen.has(fullPicture)) {
    seen.add(fullPicture);
    out.push(fullPicture);
  }
  return out;
}

/**
 * Map một phần tử `data[]` từ `/{page-id}/posts` sang object gọn cho phân tích / prompt AI.
 */
export function mapGraphPostToCompetitorCompact(
  raw: unknown,
  options?: { maxCaptionChars?: number },
): CompetitorPostCompact | null {
  const o = asRecord(raw);
  if (!o) {
    return null;
  }
  const id = o.id;
  if (typeof id !== 'string' || !id) {
    return null;
  }
  const created =
    typeof o.created_time === 'string' && o.created_time
      ? o.created_time
      : new Date(0).toISOString();
  const message = typeof o.message === 'string' ? o.message : '';
  const maxCap = options?.maxCaptionChars ?? DEFAULT_MAX_CAPTION_CHARS;
  const trimmed = message.trim();
  const txtTruncated = trimmed.length > maxCap;
  const txt = txtTruncated ? trimmed.slice(0, maxCap) : trimmed;

  const fullPicture =
    typeof o.full_picture === 'string' && o.full_picture.length > 0
      ? o.full_picture
      : null;

  const { mediaTypes, attachmentImageSrcs } = parseAttachments(o.attachments);
  const imageUrlsForAi = buildImageUrlsForAi(attachmentImageSrcs, fullPicture);
  const { texts: comments, totalFromGraph: cmtCount } = parseComments(o.comments);

  return {
    id,
    t: created,
    txt,
    txtTruncated,
    mediaTypes,
    imageUrlsForAi,
    primaryImageUrl: imageUrlsForAi[0] ?? null,
    comments,
    cmtCount,
  };
}

export function mapGraphPostsDataToCompact(
  data: unknown,
  options?: { maxCaptionChars?: number },
): CompetitorPostCompact[] {
  if (!Array.isArray(data)) {
    return [];
  }
  const out: CompetitorPostCompact[] = [];
  for (const row of data) {
    const m = mapGraphPostToCompetitorCompact(row, options);
    if (m) {
      out.push(m);
    }
  }
  return out;
}
