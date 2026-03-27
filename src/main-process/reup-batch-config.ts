/**
 * Giới hạn song songh + retry cho batch reup lớn (hàng trăm / nghìn job).
 * Graph và OpenRouter đều có rate limit — tăng concurrency có thể gây 429/4/17/32.
 */

/** Số request OpenRouter chạy đồng thời (mỗi request = 1 caption). */
export const REUP_OPENROUTER_CONCURRENCY = 6;

/** Số POST /{page-id}/videos đồng thời (an toàn hơn OpenRouter). */
export const REUP_GRAPH_VIDEO_CONCURRENCY = 5;

/** Số lần thử lại tối đa (gồm lần đầu). */
export const REUP_HTTP_MAX_ATTEMPTS = 6;

/** Trễ lũy thừa: base * 2^(attempt-1), cộng jitter. */
export const REUP_HTTP_RETRY_BASE_MS = 900;

export const REUP_HTTP_RETRY_MAX_MS = 60_000;

/** Log tiến độ đăng lịch mỗi N job (giảm I/O khi hàng nghìn job). */
export const REUP_SCHEDULE_PROGRESS_EVERY = 50;
