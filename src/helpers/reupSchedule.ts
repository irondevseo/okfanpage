export type TimeSlot = { hour: number; minute: number };

/** Chuỗi "7:00", "12:30" — mỗi dòng hoặc phân tách bởi dấu phẩy. */
export function parseTimeSlotsInput(text: string): TimeSlot[] | null {
  const parts = text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  const slots: TimeSlot[] = [];
  for (const p of parts) {
    const m = p.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) {
      return null;
    }
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h < 0 || h > 23 || min < 0 || min > 59 || Number.isNaN(h) || Number.isNaN(min)) {
      return null;
    }
    slots.push({ hour: h, minute: min });
  }
  slots.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  return slots;
}

function dateAtLocalSlot(baseMidnight: Date, slot: TimeSlot): Date {
  return new Date(
    baseMidnight.getFullYear(),
    baseMidnight.getMonth(),
    baseMidnight.getDate(),
    slot.hour,
    slot.minute,
    0,
    0,
  );
}

/**
 * Sinh đúng `count` mốc Unix (giây), mỗi mốc >= minUnixSeconds,
 * lần lượt theo các khung giờ trong ngày (local), sang ngày mới khi hết slot.
 */
export function allocateScheduleTimes(
  count: number,
  slots: TimeSlot[],
  minUnixSeconds: number,
): number[] {
  if (count === 0 || slots.length === 0) {
    return [];
  }
  const minMs = minUnixSeconds * 1000;
  const out: number[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let d = 0; d < 800 && out.length < count; d++) {
    const dayBase = new Date(start);
    dayBase.setDate(start.getDate() + d);
    for (const slot of slots) {
      const t = dateAtLocalSlot(dayBase, slot).getTime();
      if (t >= minMs) {
        out.push(Math.floor(t / 1000));
        if (out.length >= count) {
          break;
        }
      }
    }
  }
  return out;
}

export type ReupScheduleInput = {
  videoKeys: string[];
  targetPageIds: string[];
  pageTokensById: Record<string, string>;
  slots: TimeSlot[];
  descriptions: string[];
  fileUrls: string[];
  minLeadSeconds?: number;
};

export type BuiltReupJob = {
  videoKey: string;
  targetPageId: string;
  pageAccessToken: string;
  fileUrl: string;
  description: string;
  scheduledPublishTime: number;
  /**
   * true khi video này lặp lại trên cùng page (vượt quá số video gốc).
   * Frontend dùng flag này để gọi AI viết lại description trước khi đăng.
   */
  isDuplicate: boolean;
};

export type SchedulePlan = {
  jobs: BuiltReupJob[];
  totalDays: number;
  slotsPerDay: number;
  slotsPerPage: number;
  uniquePerPage: number;
  duplicatesPerPage: number;
  totalJobs: number;
  totalDuplicates: number;
};

/**
 * Phân bổ per-page, full-day:
 * - Mỗi page nhận đủ S bài/ngày (S = số khung giờ), không có ngày lẻ.
 * - Số ngày = ceil(V / S) để mỗi video gốc xuất hiện ít nhất 1 lần.
 * - Video xoay vòng (cycle) khi hết; mỗi page bắt đầu lệch 1 video để tránh cùng nội dung cùng lúc.
 * - Bài lặp (isDuplicate=true) nên được AI viết lại description.
 */
export function buildReupJobs(input: ReupScheduleInput): SchedulePlan {
  const P = input.targetPageIds.length;
  const S = input.slots.length;
  const V = input.videoKeys.length;

  if (P === 0 || S === 0 || V === 0) {
    return {
      jobs: [],
      totalDays: 0,
      slotsPerDay: S,
      slotsPerPage: 0,
      uniquePerPage: 0,
      duplicatesPerPage: 0,
      totalJobs: 0,
      totalDuplicates: 0,
    };
  }

  const D = Math.ceil(V / S);
  const slotsPerPage = D * S;
  const duplicatesPerPage = slotsPerPage - V;

  const lead = input.minLeadSeconds ?? 600;
  const minUnix = Math.floor(Date.now() / 1000) + lead;

  const jobs: BuiltReupJob[] = [];

  for (let p = 0; p < P; p++) {
    const pageId = input.targetPageIds[p];
    const token = input.pageTokensById[pageId];
    if (!token) continue;

    const times = allocateScheduleTimes(slotsPerPage, input.slots, minUnix);

    for (let i = 0; i < slotsPerPage; i++) {
      if (!times[i]) continue;
      const videoIdx = (p + i) % V;
      jobs.push({
        videoKey: input.videoKeys[videoIdx],
        targetPageId: pageId,
        pageAccessToken: token,
        fileUrl: input.fileUrls[videoIdx],
        description: input.descriptions[videoIdx],
        scheduledPublishTime: times[i],
        isDuplicate: i >= V,
      });
    }
  }

  const totalDuplicates = jobs.filter((j) => j.isDuplicate).length;

  return {
    jobs,
    totalDays: D,
    slotsPerDay: S,
    slotsPerPage,
    uniquePerPage: V,
    duplicatesPerPage,
    totalJobs: jobs.length,
    totalDuplicates,
  };
}
