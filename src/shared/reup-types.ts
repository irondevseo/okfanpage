export type ReupVideoDTO = {
  id: string;
  sourcePageId: string;
  sourcePageName: string;
  /** URL mp4 từ Graph — có thể null nếu video bị hạn chế. */
  sourceUrl: string | null;
  description: string;
  permalinkUrl: string | null;
  picture: string | null;
  thumbnails: string[];
  views: number | null;
};

export type ReupFetchPageOk = {
  ok: true;
  inputLabel: string;
  page: { id: string; name: string };
  videos: ReupVideoDTO[];
};

export type ReupFetchPageErr = {
  ok: false;
  inputLabel: string;
  message: string;
};

export type ReupFetchPageResult = ReupFetchPageOk | ReupFetchPageErr;

export type ReupFetchSourcesResult =
  | { ok: true; results: ReupFetchPageResult[] }
  | { ok: false; code: 'NO_COOKIE' | 'INVALID' | 'NETWORK'; message: string };

export type ReupRewriteItem = { key: string; text: string };

export type ReupRewriteFailedItem = { key: string; message: string };

export type ReupRewriteResult =
  | {
      ok: true;
      items: { key: string; text: string }[];
      /** Caption lỗi sau khi chạy song songh — phần `items` vẫn áp dụng được. */
      failed?: ReupRewriteFailedItem[];
    }
  | { ok: false; message: string };

export type ReupScheduleJobPayload = {
  targetPageId: string;
  pageAccessToken: string;
  fileUrl: string;
  description: string;
  scheduledPublishTime: number;
  videoKey: string;
};

export type ReupScheduleJobOk = {
  ok: true;
  videoKey: string;
  targetPageId: string;
  postId?: string;
};

export type ReupScheduleJobErr = {
  ok: false;
  videoKey: string;
  targetPageId: string;
  message: string;
};

export type ReupScheduleBatchResult = {
  jobs: (ReupScheduleJobOk | ReupScheduleJobErr)[];
};

/** Main → renderer trong lúc `reup:scheduleVideos` chạy. */
export type ReupScheduleProgressPayload = {
  completed: number;
  total: number;
  successCount: number;
  failCount: number;
  /** Job vừa xong — thiếu khi gói `started` (completed === 0). */
  videoKey?: string;
  targetPageId?: string;
  ok?: boolean;
  postId?: string;
  message?: string;
};
