import { useAuth } from '../context/AuthContext';
import { useFanPages } from '../context/FanPagesContext';
import type { FanPage } from '../shared/fanpage-types';

function formatInt(n: number | null): string {
  if (n === null || Number.isNaN(n)) {
    return '—';
  }
  return new Intl.NumberFormat('vi-VN').format(n);
}

function formatTime(ts: number | null): string {
  if (ts === null) {
    return '';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(ts));
}

function FanPageCard({ page }: { page: FanPage }) {
  const hasToken = page.pageAccessToken.length > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-black/20 transition hover:border-slate-700">
      <div className="flex gap-4 p-4">
        <div className="shrink-0">
          {page.pictureUrl ? (
            <img
              src={page.pictureUrl}
              alt=""
              className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-700"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-800 text-lg font-semibold text-slate-400">
              {page.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-white">
              {page.name}
            </h3>
            {page.verificationStatus === 'blue_verified' && (
              <span
                className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-300"
                title="Đã xác minh"
              >
                Xác minh
              </span>
            )}
            {page.isPublished === false && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-200/90">
                Nháp
              </span>
            )}
          </div>
          {page.category && (
            <p className="mt-1 truncate text-xs text-slate-500">{page.category}</p>
          )}
          <p className="mt-2 font-mono text-[11px] text-slate-600">ID {page.id}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px border-t border-slate-800 bg-slate-800/80 sm:grid-cols-4">
        <div className="bg-slate-900/80 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Thích</p>
          <p className="text-sm font-medium text-slate-200">{formatInt(page.fanCount)}</p>
        </div>
        <div className="bg-slate-900/80 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Theo dõi</p>
          <p className="text-sm font-medium text-slate-200">
            {formatInt(page.followersCount)}
          </p>
        </div>
        <div className="bg-slate-900/80 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Page token</p>
          <p className="text-sm font-medium text-emerald-400/90">
            {hasToken ? 'Có' : 'Không'}
          </p>
        </div>
        <div className="bg-slate-900/80 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Trang</p>
          {page.link ? (
            <a
              href={page.link}
              target="_blank"
              rel="noreferrer"
              className="inline-block truncate text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Mở Facebook
            </a>
          ) : (
            <p className="text-sm text-slate-600">—</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function HomePage() {
  const { profile } = useAuth();
  const { pages, loadStatus, error, lastLoadedAt, reloadFanPages } = useFanPages();

  if (!profile) {
    return null;
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-8">
      <section className="min-w-0 flex-1">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Fanpage</h2>
            <p className="mt-1 text-xs text-slate-500">
              Tối đa 100 page mỗi lần tải (Graph API). Danh sách được giữ trong app cho đến
              khi bạn bấm làm mới.
            </p>
            {lastLoadedAt !== null && loadStatus === 'ready' && (
              <p className="mt-1 text-xs text-slate-600">
                Cập nhật lần cuối: {formatTime(lastLoadedAt)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void reloadFanPages()}
            disabled={loadStatus === 'loading'}
            className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadStatus === 'loading' ? 'Đang tải…' : 'Làm mới danh sách'}
          </button>
        </div>

        {error && loadStatus === 'error' && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200/90"
          >
            {error}
          </div>
        )}

        {loadStatus === 'loading' && pages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 py-20">
            <div
              className="h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500"
              aria-hidden
            />
            <p className="text-sm text-slate-500">Đang tải Fanpage…</p>
          </div>
        )}

        {loadStatus === 'ready' && pages.length === 0 && (
          <p className="rounded-2xl border border-slate-800 bg-slate-900/40 py-12 text-center text-sm text-slate-500">
            Không có Fanpage nào hoặc token chưa đủ quyền <code className="text-slate-400">pages_show_list</code>.
          </p>
        )}

        {pages.length > 0 && (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {pages.map((page) => (
              <li key={page.id}>
                <FanPageCard page={page} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
