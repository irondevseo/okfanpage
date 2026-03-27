import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { competitorAnalyze, competitorFetchPosts } from '../services/competitorClient';
import type {
  CompetitorFetchPostsResult,
  CompetitorPagePostsResult,
} from '../shared/competitor-analysis-types';

function isPageOk(
  r: CompetitorPagePostsResult,
): r is Extract<CompetitorPagePostsResult, { ok: true }> {
  return r.ok === true;
}

export function CompetitorAnalysisPage() {
  const { openRouter, openRouterReady } = useSettings();
  const [urlsText, setUrlsText] = useState('');
  const [limit, setLimit] = useState(25);
  const [commentsLimit, setCommentsLimit] = useState(50);
  const [maxPostsForAi, setMaxPostsForAi] = useState(25);
  const [hint, setHint] = useState('');

  const [fetching, setFetching] = useState(false);
  const [fetchResult, setFetchResult] = useState<CompetitorFetchPostsResult | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const okPages = useMemo(() => {
    if (!fetchResult?.ok) {
      return [];
    }
    return fetchResult.results.filter(isPageOk);
  }, [fetchResult]);

  const pagesForAnalyze = useMemo(
    () =>
      okPages
        .filter((p) => p.posts.length > 0)
        .map((p) => ({
          pageId: p.pageId,
          pageName: p.pageName,
          sourceUrl: p.sourceUrl,
          posts: p.posts,
        })),
    [okPages],
  );

  const canAnalyze =
    openRouterReady &&
    openRouter?.hasApiKey &&
    pagesForAnalyze.length > 0 &&
    !fetching &&
    !analyzing;

  const onFetch = useCallback(async () => {
    setBannerError(null);
    setReport(null);
    setFetching(true);
    try {
      const res = await competitorFetchPosts({
        pageUrlsText: urlsText,
        limit,
        commentsLimit,
        maxPages: 3,
      });
      setFetchResult(res);
      if (res.ok === false) {
        setBannerError(res.message);
      }
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : 'Không tải được dữ liệu.');
    } finally {
      setFetching(false);
    }
  }, [urlsText, limit, commentsLimit]);

  const onAnalyze = useCallback(async () => {
    if (pagesForAnalyze.length === 0) {
      return;
    }
    setBannerError(null);
    setAnalyzing(true);
    try {
      const res = await competitorAnalyze({
        pages: pagesForAnalyze,
        userHint: hint.trim() || undefined,
        maxPostsPerPage: maxPostsForAi,
      });
      if (res.ok === false) {
        setBannerError(res.message);
      } else {
        setReport(res.report);
      }
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : 'Phân tích thất bại.');
    } finally {
      setAnalyzing(false);
    }
  }, [pagesForAnalyze, hint, maxPostsForAi]);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-8 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold text-white">Phân tích đối thủ</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Nhập tối đa 3 link Fanpage (mỗi dòng một URL). App gọi Graph lấy bài viết gần đây, gom
          caption — comment mẫu — thumbnail (ảnh/video) rồi đưa vào OpenRouter để báo cáo.
          Cần{' '}
          <Link to="/settings/api-ai" className="text-blue-400 underline-offset-2 hover:underline">
            API AI (OpenRouter)
          </Link>{' '}
          và phiên Facebook hợp lệ.
        </p>
      </div>

      {bannerError && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200/90"
        >
          {bannerError}
        </div>
      )}

      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          1. Tải dữ liệu Graph
        </h2>
        <label className="mt-4 block text-xs font-medium text-slate-400">
          URL Fanpage (tối đa 3 dòng)
        </label>
        <textarea
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          rows={4}
          placeholder="https://www.facebook.com/tenpage&#10;https://www.facebook.com/pagekhac"
          className="mt-1.5 w-full resize-y rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
        />
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Cho phép dán link thiếu <code className="text-slate-500">https://</code>.{' '}
          <code className="text-slate-500">profile.php?id=…</code> thường là trang cá nhân (User) — Graph
          không đọc bài như Fanpage; hãy mở đúng Page (username hoặc trang Page). Nếu báo lỗi quyền với Page
          người khác, app Meta cần{' '}
          <code className="text-slate-500">pages_read_engagement</code> hoặc Page Public Content Access.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Số bài / page
            <input
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 25)}
              className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Comment tối đa / bài
            <input
              type="number"
              min={1}
              max={100}
              value={commentsLimit}
              onChange={(e) => setCommentsLimit(Number(e.target.value) || 50)}
              className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={fetching || !urlsText.trim()}
          onClick={() => void onFetch()}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {fetching ? 'Đang tải…' : 'Tải bài viết'}
        </button>

        {fetchResult?.ok && (
          <ul className="mt-6 space-y-2 border-t border-slate-800/80 pt-5 text-sm">
            {fetchResult.results.map((r, i) => (
              <li
                key={`${r.sourceUrl}-${i}`}
                className="rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2"
              >
                {r.ok === false ? (
                  <p className="text-amber-200/90">
                    Lỗi <span className="text-slate-400">{r.sourceUrl}</span>: {r.message}
                  </p>
                ) : (
                  <div>
                    <p className="text-slate-300">
                      <span className="font-medium text-white">{r.pageName}</span>
                      <span className="text-slate-500"> · {r.posts.length} bài</span>
                    </p>
                    {r.posts.length === 0 && (
                      <p className="mt-1 text-xs text-amber-200/80">
                        Graph trả về 0 bài — có thể thiếu quyền (PPCA / pages_read_engagement) hoặc Page không
                        có bài public.
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          2. Phân tích AI (OpenRouter)
        </h2>
        {!openRouterReady ? (
          <p className="mt-3 text-sm text-slate-500">Đang tải cấu hình…</p>
        ) : !openRouter?.hasApiKey ? (
          <p className="mt-3 text-sm text-amber-200/90">
            Chưa có API key — vào{' '}
            <Link to="/settings/api-ai" className="underline-offset-2 hover:underline">
              Cài đặt → API AI
            </Link>
            .
          </p>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Model hiện tại:{' '}
            <code className="text-slate-400">{openRouter.modelId}</code>
          </p>
        )}
        <label className="mt-4 block text-xs font-medium text-slate-400">
          Gợi ý thêm (tùy chọn)
        </label>
        <textarea
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          rows={2}
          placeholder="Ví dụ: So sánh khung giờ đăng giữa các page; tìp pattern caption viral…"
          className="mt-1.5 w-full resize-y rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
        />
        <label className="mt-4 flex w-fit flex-col gap-1 text-xs text-slate-500">
          Số bài tối đa / page đưa vào prompt
          <input
            type="number"
            min={1}
            max={50}
            value={maxPostsForAi}
            onChange={(e) => setMaxPostsForAi(Number(e.target.value) || 25)}
            className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100"
          />
        </label>
        <button
          type="button"
          disabled={!canAnalyze}
          onClick={() => void onAnalyze()}
          className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analyzing ? 'Đang phân tích…' : 'Chạy phân tích AI'}
        </button>
        {!canAnalyze && openRouter?.hasApiKey && pagesForAnalyze.length === 0 && fetchResult?.ok && (
          <p className="mt-2 text-xs text-slate-500">
            Không có bài nào sau bước tải — kiểm tra quyền Graph hoặc page không có post public.
          </p>
        )}
      </section>

      {report && (
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Báo cáo
          </h2>
          <div className="mt-4 max-w-none rounded-xl border border-slate-800/60 bg-slate-950/50 p-4 text-sm leading-relaxed text-slate-200">
            <pre className="whitespace-pre-wrap font-sans text-[13px]">{report}</pre>
          </div>
        </section>
      )}
    </div>
  );
}
