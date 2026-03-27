import { randomUUID } from 'node:crypto';
import { createTypedStore } from './typed-store';
import type {
  PostHistoryEntry,
  PostHistoryFilter,
  PostHistoryStats,
  PostStatus,
} from '../shared/post-history-types';

type PostHistorySchema = {
  entries?: PostHistoryEntry[];
};

const store = createTypedStore<PostHistorySchema>({
  name: 'okfanpage-post-history',
  defaults: { entries: [] },
});

function readAll(): PostHistoryEntry[] {
  return store.get('entries') ?? [];
}

function writeAll(entries: PostHistoryEntry[]): void {
  store.set('entries', entries);
}

export function addPostHistoryEntry(
  data: Omit<PostHistoryEntry, 'id' | 'createdAt'>,
): PostHistoryEntry {
  const entry: PostHistoryEntry = {
    ...data,
    id: randomUUID(),
    createdAt: Date.now(),
  };
  const all = readAll();
  all.unshift(entry);
  writeAll(all);
  return entry;
}

export function upsertPostHistoryEntry(
  data: Omit<PostHistoryEntry, 'id' | 'createdAt'> & { id?: string },
): PostHistoryEntry {
  const all = readAll();
  const existing = data.id ? all.find((e) => e.id === data.id) : undefined;
  if (existing) {
    Object.assign(existing, data);
    writeAll(all);
    return existing;
  }
  return addPostHistoryEntry(data);
}

export function updatePostStatus(
  id: string,
  status: PostStatus,
  extra?: { fbPostId?: string; errorMessage?: string },
): PostHistoryEntry | null {
  const all = readAll();
  const entry = all.find((e) => e.id === id);
  if (!entry) return null;
  entry.status = status;
  if (extra?.fbPostId) entry.fbPostId = extra.fbPostId;
  if (extra?.errorMessage) entry.errorMessage = extra.errorMessage;
  writeAll(all);
  return entry;
}

export function deletePostHistoryEntry(id: string): boolean {
  const all = readAll();
  const idx = all.findIndex((e) => e.id === id);
  if (idx < 0) return false;
  all.splice(idx, 1);
  writeAll(all);
  return true;
}

export function clearPostHistory(pageId?: string): number {
  if (!pageId) {
    const count = readAll().length;
    writeAll([]);
    return count;
  }
  const all = readAll();
  const filtered = all.filter((e) => e.pageId !== pageId);
  const removed = all.length - filtered.length;
  writeAll(filtered);
  return removed;
}

function matchesFilter(entry: PostHistoryEntry, filter: PostHistoryFilter): boolean {
  if (filter.pageIds?.length && !filter.pageIds.includes(entry.pageId)) return false;
  if (filter.statuses?.length && !filter.statuses.includes(entry.status)) return false;
  if (filter.dateFrom && entry.scheduledAt < filter.dateFrom) return false;
  if (filter.dateTo && entry.scheduledAt > filter.dateTo) return false;
  if (filter.search) {
    const q = filter.search.toLowerCase();
    const hay = `${entry.description} ${entry.pageName} ${entry.fbPostId ?? ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function listPostHistory(filter: PostHistoryFilter): {
  entries: PostHistoryEntry[];
  total: number;
} {
  const all = readAll();
  const filtered = all.filter((e) => matchesFilter(e, filter));
  filtered.sort((a, b) => b.scheduledAt - a.scheduledAt);
  return { entries: filtered, total: filtered.length };
}

export function getPostHistoryStats(): PostHistoryStats {
  const all = readAll();
  const byPage = new Map<string, { pageName: string; count: number }>();

  let scheduled = 0;
  let published = 0;
  let failed = 0;
  let processing = 0;

  for (const e of all) {
    if (e.status === 'scheduled') scheduled++;
    else if (e.status === 'published') published++;
    else if (e.status === 'failed') failed++;
    else if (e.status === 'processing') processing++;

    const pg = byPage.get(e.pageId);
    if (pg) pg.count++;
    else byPage.set(e.pageId, { pageName: e.pageName, count: 1 });
  }

  return {
    total: all.length,
    scheduled,
    published,
    failed,
    processing,
    byPage: Array.from(byPage.entries()).map(([pageId, v]) => ({
      pageId,
      pageName: v.pageName,
      count: v.count,
    })),
  };
}

/**
 * Merge entries đồng bộ từ Facebook — tránh trùng fbPostId.
 * Trả về số entry mới thêm.
 */
export function mergeSyncedEntries(incoming: PostHistoryEntry[]): number {
  const all = readAll();
  const existingFbIds = new Set(
    all.filter((e) => e.fbPostId).map((e) => e.fbPostId),
  );
  let added = 0;
  for (const e of incoming) {
    if (e.fbPostId && existingFbIds.has(e.fbPostId)) continue;
    all.unshift(e);
    added++;
  }
  if (added > 0) writeAll(all);
  return added;
}

/**
 * Tự động cập nhật status: entries hẹn scheduledAt < now mà vẫn 'scheduled' → 'published'.
 */
export function autoPromoteScheduled(): number {
  const now = Math.floor(Date.now() / 1000);
  const all = readAll();
  let promoted = 0;
  for (const e of all) {
    if (e.status === 'scheduled' && e.scheduledAt <= now) {
      e.status = 'published';
      promoted++;
    }
  }
  if (promoted > 0) writeAll(all);
  return promoted;
}
