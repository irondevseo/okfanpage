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
};

/**
 * Video thứ i → page (i % M), thời gian là mốc thứ i theo thứ tự khung giờ trong ngày.
 */
export function buildReupJobs(input: ReupScheduleInput): BuiltReupJob[] {
  const M = input.targetPageIds.length;
  if (M === 0 || input.slots.length === 0) {
    return [];
  }
  const n = input.videoKeys.length;
  const lead = input.minLeadSeconds ?? 600;
  const minUnix = Math.floor(Date.now() / 1000) + lead;
  const times = allocateScheduleTimes(n, input.slots, minUnix);
  const jobs: BuiltReupJob[] = [];
  for (let i = 0; i < n; i++) {
    const pageIdx = i % M;
    const targetPageId = input.targetPageIds[pageIdx];
    const token = input.pageTokensById[targetPageId];
    if (!token || !times[i]) {
      continue;
    }
    jobs.push({
      videoKey: input.videoKeys[i],
      targetPageId,
      pageAccessToken: token,
      fileUrl: input.fileUrls[i],
      description: input.descriptions[i] ?? '',
      scheduledPublishTime: times[i],
    });
  }
  return jobs;
}
