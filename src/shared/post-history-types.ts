export type PostStatus = 'scheduled' | 'published' | 'failed' | 'processing';

export interface PostHistoryEntry {
  /** UUID nội bộ. */
  id: string;
  /** Facebook post/video ID (nếu có). */
  fbPostId?: string;
  /** Page đăng bài. */
  pageId: string;
  pageName: string;
  pageAvatar?: string;
  /** Nội dung caption. */
  description: string;
  /** URL thumbnail (source video). */
  thumbnail?: string;
  /** Unix seconds – thời điểm hẹn đăng (scheduledPublishTime). */
  scheduledAt: number;
  /** Trạng thái bài đăng. */
  status: PostStatus;
  /** Thông báo lỗi nếu failed. */
  errorMessage?: string;
  /** Thời điểm tạo entry (ms). */
  createdAt: number;
  /** Nguồn video (videoKey / sourceUrl). */
  sourceVideoKey?: string;
  /** Đánh dấu entry được đồng bộ từ FB (không phải do app tạo). */
  syncedFromFb?: boolean;
}

export interface PostHistoryFilter {
  pageIds?: string[];
  statuses?: PostStatus[];
  search?: string;
  dateFrom?: number;
  dateTo?: number;
}

export interface PostHistoryListResult {
  ok: true;
  entries: PostHistoryEntry[];
  total: number;
}

export interface PostHistorySyncResult {
  ok: boolean;
  synced: number;
  message?: string;
}

export interface PostHistoryStats {
  total: number;
  scheduled: number;
  published: number;
  failed: number;
  processing: number;
  byPage: { pageId: string; pageName: string; count: number }[];
}
