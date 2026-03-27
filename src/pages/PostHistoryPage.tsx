import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  PostHistoryEntry,
  PostHistoryFilter,
  PostHistoryStats,
  PostStatus,
} from '../shared/post-history-types';
import {
  postHistoryList,
  postHistoryStats,
  postHistoryDelete,
  postHistoryClear,
} from '../services/postHistoryClient';

const STATUS_LABELS: Record<PostStatus, string> = {
  scheduled: 'Hẹn đăng',
  published: 'Đã đăng',
  failed: 'Thất bại',
  processing: 'Đang xử lý',
};

const STATUS_COLORS: Record<PostStatus, string> = {
  scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  published: 'bg-green-500/20 text-green-300 border-green-500/30',
  failed: 'bg-red-500/20 text-red-300 border-red-500/30',
  processing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

function fmtDate(unix: number): string {
  const d = new Date(unix * 1000);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mn = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mn}`;
}

function timeAgo(unix: number): string {
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 0) {
    const abs = Math.abs(diff);
    if (abs < 3600) return `trong ${Math.ceil(abs / 60)} phút`;
    if (abs < 86400) return `trong ${Math.ceil(abs / 3600)} giờ`;
    return `trong ${Math.ceil(abs / 86400)} ngày`;
  }
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export function PostHistoryPage() {
  const [entries, setEntries] = useState<PostHistoryEntry[]>([]);
  const [stats, setStats] = useState<PostHistoryStats | null>(null);
  const [loading, setLoading] = useState(false);

  const [filterPages, setFilterPages] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<PostStatus[]>([]);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filter = useMemo((): PostHistoryFilter => {
    const f: PostHistoryFilter = {};
    if (filterPages.length > 0) f.pageIds = filterPages;
    if (filterStatuses.length > 0) f.statuses = filterStatuses;
    if (filterSearch.trim()) f.search = filterSearch.trim();
    if (filterDateFrom) {
      f.dateFrom = Math.floor(new Date(filterDateFrom).getTime() / 1000);
    }
    if (filterDateTo) {
      const d = new Date(filterDateTo);
      d.setHours(23, 59, 59);
      f.dateTo = Math.floor(d.getTime() / 1000);
    }
    return f;
  }, [filterPages, filterStatuses, filterSearch, filterDateFrom, filterDateTo]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [listRes, statsRes] = await Promise.all([
      postHistoryList(filter),
      postHistoryStats(),
    ]);
    if (listRes.ok) setEntries(listRes.entries);
    setStats(statsRes);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => { void loadData(); }, 30_000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onDelete = useCallback(async (id: string) => {
    await postHistoryDelete(id);
    void loadData();
  }, [loadData]);

  const onClearAll = useCallback(async () => {
    if (!confirm('Xóa toàn bộ lịch sử đăng bài?')) return;
    await postHistoryClear();
    void loadData();
  }, [loadData]);

  const onClearPage = useCallback(async (pageId: string) => {
    await postHistoryClear(pageId);
    void loadData();
  }, [loadData]);

  const togglePageFilter = useCallback((pageId: string) => {
    setFilterPages((prev) =>
      prev.includes(pageId) ? prev.filter((p) => p !== pageId) : [...prev, pageId],
    );
  }, []);

  const toggleStatusFilter = useCallback((st: PostStatus) => {
    setFilterStatuses((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st],
    );
  }, []);

  const resetFilters = useCallback(() => {
    setFilterPages([]);
    setFilterStatuses([]);
    setFilterSearch('');
    setFilterDateFrom('');
    setFilterDateTo('');
  }, []);

  const hasActiveFilter =
    filterPages.length > 0 ||
    filterStatuses.length > 0 ||
    filterSearch.trim() !== '' ||
    filterDateFrom !== '' ||
    filterDateTo !== '';

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-bold text-white">Lịch sử đăng bài</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-40"
          >
            {loading ? 'Đang tải…' : 'Làm mới'}
          </button>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => void onClearAll()}
              className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-950/30"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-blue-500/20 bg-blue-950/20 px-3 py-2">
            <p className="text-lg font-bold text-blue-300">{stats.scheduled}</p>
            <p className="text-[10px] uppercase tracking-wider text-blue-400/60">Hẹn đăng</p>
          </div>
          <div className="rounded-lg border border-green-500/20 bg-green-950/20 px-3 py-2">
            <p className="text-lg font-bold text-green-300">{stats.published}</p>
            <p className="text-[10px] uppercase tracking-wider text-green-400/60">Đã đăng</p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-2">
            <p className="text-lg font-bold text-red-300">{stats.failed}</p>
            <p className="text-[10px] uppercase tracking-wider text-red-400/60">Thất bại</p>
          </div>
          <div className="rounded-lg border border-slate-500/20 bg-slate-800/40 px-3 py-2">
            <p className="text-lg font-bold text-slate-200">{stats.total}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400/60">Tổng cộng</p>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm theo caption, tên page…"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 pl-8 text-xs text-slate-100 placeholder-slate-600 outline-none ring-blue-500/40 transition focus:border-blue-500 focus:ring-1"
            />
            <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={[
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition',
              showFilters || hasActiveFilter
                ? 'border-blue-500/40 bg-blue-950/30 text-blue-300'
                : 'border-slate-600 text-slate-400 hover:bg-slate-800',
            ].join(' ')}
          >
            Bộ lọc{hasActiveFilter ? ' *' : ''}
          </button>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-slate-500 transition hover:text-slate-300"
            >
              Xóa lọc
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid gap-3 rounded-lg border border-slate-700/60 bg-slate-800/30 p-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status filter */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Trạng thái</p>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(STATUS_LABELS) as PostStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleStatusFilter(st)}
                    className={[
                      'rounded-md border px-2 py-0.5 text-[11px] font-medium transition',
                      filterStatuses.includes(st)
                        ? STATUS_COLORS[st]
                        : 'border-slate-700 text-slate-500 hover:text-slate-300',
                    ].join(' ')}
                  >
                    {STATUS_LABELS[st]}
                  </button>
                ))}
              </div>
            </div>

            {/* Page filter */}
            {stats && stats.byPage.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Page</p>
                <div className="flex flex-wrap gap-1">
                  {stats.byPage.map((pg) => (
                    <button
                      key={pg.pageId}
                      type="button"
                      onClick={() => togglePageFilter(pg.pageId)}
                      className={[
                        'rounded-md border px-2 py-0.5 text-[11px] font-medium transition',
                        filterPages.includes(pg.pageId)
                          ? 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300'
                          : 'border-slate-700 text-slate-500 hover:text-slate-300',
                      ].join(' ')}
                    >
                      {pg.pageName} ({pg.count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date range */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Từ ngày</p>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Đến ngày</p>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {entries.length} bài{hasActiveFilter ? ' (đã lọc)' : ''}
        </p>
      </div>

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <div className="rounded-full bg-slate-800 p-4">
            <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-400">
            {hasActiveFilter ? 'Không tìm thấy bài nào phù hợp' : 'Chưa có lịch sử đăng bài'}
          </p>
          <p className="text-xs text-slate-600">
            {hasActiveFilter
              ? 'Thử thay đổi bộ lọc'
              : 'Đăng bài từ trang Reup video để bắt đầu theo dõi'}
          </p>
        </div>
      )}

      {/* Entry list — compact rows */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-1">
          {entries.map((e) => {
            const isExpanded = expandedId === e.id;
            return (
              <div
                key={e.id}
                className="group rounded-lg border border-slate-700/40 bg-slate-800/30 transition hover:border-slate-600/60"
              >
                {/* Main row */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : e.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left"
                >
                  {/* Status badge */}
                  <span
                    className={[
                      'flex-shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold',
                      STATUS_COLORS[e.status],
                    ].join(' ')}
                  >
                    {STATUS_LABELS[e.status]}
                  </span>

                  {/* Page name */}
                  <span className="flex-shrink-0 truncate text-xs font-medium text-indigo-300" style={{ maxWidth: '120px' }}>
                    {e.pageName}
                  </span>

                  {/* Caption snippet */}
                  <span className="min-w-0 flex-1 truncate text-xs text-slate-400">
                    {e.description || '(không có caption)'}
                  </span>

                  {/* Time */}
                  <span className="flex-shrink-0 text-[11px] text-slate-500" title={fmtDate(e.scheduledAt)}>
                    {timeAgo(e.scheduledAt)}
                  </span>

                  {/* Chevron */}
                  <svg
                    className={[
                      'h-3.5 w-3.5 flex-shrink-0 text-slate-600 transition-transform',
                      isExpanded ? 'rotate-180' : '',
                    ].join(' ')}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-700/30 px-3 py-2.5">
                    <div className="grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
                      <div>
                        <span className="text-slate-600">Page: </span>
                        <span className="text-slate-300">{e.pageName}</span>
                        <span className="ml-1 text-slate-600">({e.pageId})</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Hẹn: </span>
                        <span className="text-slate-300">{fmtDate(e.scheduledAt)}</span>
                      </div>
                      {e.fbPostId && (
                        <div>
                          <span className="text-slate-600">FB Post ID: </span>
                          <span className="font-mono text-slate-300">{e.fbPostId}</span>
                        </div>
                      )}
                      {e.sourceVideoKey && (
                        <div>
                          <span className="text-slate-600">Source: </span>
                          <span className="truncate font-mono text-slate-400">{e.sourceVideoKey}</span>
                        </div>
                      )}
                      {e.errorMessage && (
                        <div className="sm:col-span-2">
                          <span className="text-red-500">Lỗi: </span>
                          <span className="text-red-300">{e.errorMessage}</span>
                        </div>
                      )}
                      {e.description && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-600">Caption: </span>
                          <p className="mt-0.5 whitespace-pre-wrap text-slate-400">{e.description}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void onDelete(e.id)}
                        className="rounded border border-red-500/30 px-2 py-0.5 text-[11px] font-medium text-red-400 transition hover:bg-red-950/30"
                      >
                        Xóa
                      </button>
                      {e.pageId && (
                        <button
                          type="button"
                          onClick={() => void onClearPage(e.pageId)}
                          className="rounded border border-slate-600 px-2 py-0.5 text-[11px] font-medium text-slate-400 transition hover:bg-slate-800"
                        >
                          Xóa hết của page này
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
