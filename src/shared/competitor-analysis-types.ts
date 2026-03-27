/** Bài viết đã gọn để đưa vào AI / UI phân tích đối thủ. */
export type CompetitorPostCompact = {
  id: string;
  /** ISO 8601 từ Graph `created_time`. */
  t: string;
  /** Caption (đã trim; có thể bị cắt — xem `txtTruncated`). */
  txt: string;
  txtTruncated: boolean;
  /** `media_type` từ từng attachment (photo, video, …). */
  mediaTypes: string[];
  /**
   * URL ảnh/thumbnail cho vision AI: ưu tiên `attachments[].media.image.src`
   * (thumbnail video), sau đó thêm `full_picture` nếu khác biệt.
   */
  imageUrlsForAi: string[];
  /** Tiện dụng: phần tử đầu `imageUrlsForAi`. */
  primaryImageUrl: string | null;
  /** Nội dung comment (bỏ chuỗi rỗng). */
  comments: string[];
  /** Số phần tử `comments.data` Graph trả về (có thể lớn hơn `comments.length` nếu nhiều bản ghi rỗng). */
  cmtCount: number;
};

export type CompetitorFetchPostsPayload = {
  /** Một hoặc nhiều dòng URL/username/id Page (tối đa `maxPages`). */
  pageUrlsText: string;
  /** Số bài `/posts` mỗi page (mặc định 25). */
  limit?: number;
  /** `comments.limit` mỗi bài (mặc định 50). */
  commentsLimit?: number;
  /** Tối đa số page mỗi lần gọi (mặc định 3). */
  maxPages?: number;
};

export type CompetitorPagePostsOk = {
  ok: true;
  pageId: string;
  pageName: string;
  sourceUrl: string;
  posts: CompetitorPostCompact[];
};

export type CompetitorPagePostsErr = {
  ok: false;
  sourceUrl: string;
  message: string;
};

export type CompetitorPagePostsResult = CompetitorPagePostsOk | CompetitorPagePostsErr;

export type CompetitorFetchPostsOk = {
  ok: true;
  results: CompetitorPagePostsResult[];
};

export type CompetitorFetchPostsErr = {
  ok: false;
  code: 'NO_COOKIE' | 'NETWORK' | 'INVALID' | 'NO_PAGES';
  message: string;
};

export type CompetitorFetchPostsResult = CompetitorFetchPostsOk | CompetitorFetchPostsErr;

/** Dữ liệu đã fetch — gửi lại main để phân tích AI (không gọi Graph lần nữa). */
export type CompetitorAnalyzePayload = {
  pages: Array<{
    pageId: string;
    pageName: string;
    sourceUrl: string;
    posts: CompetitorPostCompact[];
  }>;
  /** Gợi ý thêm: ví dụ “tập trung khung giờ đăng”, “so sánh comment”. */
  userHint?: string;
  /** Giới hạn số bài mỗi page đưa vào prompt (mặc định 25). */
  maxPostsPerPage?: number;
};

export type CompetitorAnalyzeResult =
  | { ok: true; report: string }
  | { ok: false; code: 'NO_KEY' | 'NETWORK' | 'INVALID'; message: string };
