import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useFanPages } from '../context/FanPagesContext';
import { useSettings } from '../context/SettingsContext';
import { buildReupJobs, parseTimeSlotsInput, type SchedulePlan } from '../helpers/reupSchedule';
import type {
  ReupFetchPageResult,
  ReupScheduleJobErr,
  ReupScheduleProgressPayload,
  ReupVideoDTO,
} from '../shared/reup-types';
import {
  reupFetchSources,
  reupRewriteCaptions,
  reupScheduleVideos,
  subscribeReupScheduleProgress,
} from '../services/reupClient';
import {
  settingsGetContentPrompt,
  settingsGetReupRemix,
} from '../services/settingsClient';

function videoKey(v: ReupVideoDTO): string {
  return `${v.sourcePageId}_${v.id}`;
}

function formatInt(n: number | null): string {
  if (n === null || Number.isNaN(n)) {
    return '—';
  }
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function ReupContentPage() {
  const { pages, loadStatus } = useFanPages();
  const { openRouter } = useSettings();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [linksText, setLinksText] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchPages, setFetchPages] = useState<ReupFetchPageResult[]>([]);

  const flatVideos = useMemo(() => {
    const list: ReupVideoDTO[] = [];
    for (const r of fetchPages) {
      if (r.ok) {
        list.push(...r.videos);
      }
    }
    return list;
  }, [fetchPages]);

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [descByKey, setDescByKey] = useState<Record<string, string>>({});

  const [pageSearch, setPageSearch] = useState('');
  const [targetPageIds, setTargetPageIds] = useState<Set<string>>(new Set());

  const [slotsText, setSlotsText] = useState('7:00\n12:00\n15:00\n20:00');
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteFailedKeys, setRewriteFailedKeys] = useState<string[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleLog, setScheduleLog] = useState<string | null>(null);
  const [scheduleProgress, setScheduleProgress] =
    useState<ReupScheduleProgressPayload | null>(null);
  const [remixPipelineOn, setRemixPipelineOn] = useState(false);

  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [schedulePlan, setSchedulePlan] = useState<SchedulePlan | null>(null);
  const [rewriteDuplicatesLoading, setRewriteDuplicatesLoading] = useState(false);

  useEffect(() => {
    if (step !== 4) {
      return;
    }
    void settingsGetReupRemix().then((r) => setRemixPipelineOn(r.enabled));
  }, [step]);

  const onFetch = async (e: FormEvent) => {
    e.preventDefault();
    setFetchError(null);
    setFetchLoading(true);
    setFetchPages([]);
    setSelectedKeys(new Set());
    setDescByKey({});
    try {
      const r = await reupFetchSources(linksText);
      if (r.ok === false) {
        setFetchError(r.message);
        return;
      }
      setFetchPages(r.results);
      const nextDesc: Record<string, string> = {};
      for (const row of r.results) {
        if (row.ok) {
          for (const v of row.videos) {
            nextDesc[videoKey(v)] = v.description ?? '';
          }
        }
      }
      setDescByKey(nextDesc);
      if (r.results.some((x) => x.ok && x.videos.length > 0)) {
        setStep(2);
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const toggleKey = (k: string) => {
    setSelectedKeys((prev) => {
      const n = new Set(prev);
      if (n.has(k)) {
        n.delete(k);
      } else {
        n.add(k);
      }
      return n;
    });
  };

  const selectAllVideos = () => {
    setSelectedKeys(new Set(flatVideos.map(videoKey)));
  };

  const clearVideoSelection = () => {
    setSelectedKeys(new Set());
  };

  const filteredPages = useMemo(() => {
    const q = pageSearch.trim().toLowerCase();
    if (!q) {
      return pages;
    }
    return pages.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
    );
  }, [pages, pageSearch]);

  const toggleTargetPage = (id: string) => {
    setTargetPageIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  const selectAllTargets = () => {
    setTargetPageIds(new Set(pages.map((p) => p.id)));
  };

  const goStep3 = () => {
    if (selectedKeys.size === 0) {
      return;
    }
    setStep(3);
  };

  const goStep4 = () => {
    if (targetPageIds.size === 0) {
      return;
    }
    setStep(4);
  };

  const doRewrite = useCallback(async (keys: string[]) => {
    if (keys.length === 0) return;
    const cp = await settingsGetContentPrompt();
    if (!cp.hasPrompt) {
      setScheduleLog('Chưa có prompt nội dung — vào Cài đặt → Prompt nội dung.');
      return;
    }
    if (!openRouter?.hasApiKey) {
      setScheduleLog('Chưa cấu hình OpenRouter API key.');
      return;
    }
    setRewriteLoading(true);
    setScheduleLog(null);
    setRewriteFailedKeys([]);
    try {
      const items = keys.map((k) => ({ key: k, text: descByKey[k] ?? '' }));
      const r = await reupRewriteCaptions(items);
      if (r.ok === false) {
        setScheduleLog(r.message);
        setRewriteFailedKeys(keys);
        return;
      }
      setDescByKey((prev) => {
        const n = { ...prev };
        for (const it of r.items) {
          n[it.key] = it.text;
        }
        return n;
      });
      const fails = r.failed;
      if (fails?.length) {
        setRewriteFailedKeys(fails.map((f) => f.key));
        const sample = fails
          .slice(0, 3)
          .map((f) => `${f.key}: ${f.message}`)
          .join(' · ');
        setScheduleLog(
          `Đã viết lại ${r.items.length}/${items.length} caption. Lỗi ${fails.length}${sample ? ` — ${sample}` : ''}${fails.length > 3 ? '…' : ''}`,
        );
      } else {
        setRewriteFailedKeys([]);
        setScheduleLog('Đã viết lại caption bằng AI.');
      }
    } finally {
      setRewriteLoading(false);
    }
  }, [descByKey, openRouter?.hasApiKey]);

  const onRewrite = useCallback(() => {
    return doRewrite([...selectedKeys]);
  }, [selectedKeys, doRewrite]);

  const onRetryFailed = useCallback(() => {
    return doRewrite(rewriteFailedKeys);
  }, [rewriteFailedKeys, doRewrite]);

  const buildPlan = useCallback((): SchedulePlan | null => {
    const slots = parseTimeSlotsInput(slotsText);
    if (!slots) return null;
    const selected = flatVideos
      .filter((v) => selectedKeys.has(videoKey(v)))
      .sort((a, b) => videoKey(a).localeCompare(videoKey(b)));
    const withSource = selected.map((v) => ({
      v,
      url: v.sourceUrl?.trim() ?? '',
    }));
    if (withSource.some((x) => !x.url)) return null;
    const targetIds = [...targetPageIds];
    const tokens: Record<string, string> = {};
    for (const p of pages) {
      if (targetPageIds.has(p.id) && p.pageAccessToken) {
        tokens[p.id] = p.pageAccessToken;
      }
    }
    return buildReupJobs({
      videoKeys: withSource.map(({ v }) => videoKey(v)),
      targetPageIds: targetIds,
      pageTokensById: tokens,
      slots,
      descriptions: withSource.map(
        ({ v }) => descByKey[videoKey(v)] ?? v.description ?? '',
      ),
      fileUrls: withSource.map(({ url }) => url),
      minLeadSeconds: 600,
    });
  }, [slotsText, flatVideos, selectedKeys, targetPageIds, pages, descByKey]);

  useEffect(() => {
    if (step === 4) setSchedulePlan(buildPlan());
  }, [step, buildPlan]);

  const onRewriteDuplicates = useCallback(async () => {
    if (!schedulePlan || schedulePlan.totalDuplicates === 0) return;
    if (!openRouter?.hasApiKey) {
      setScheduleLog('Chưa cấu hình OpenRouter API key — không thể viết lại nội dung bản lặp.');
      return;
    }
    const cp = await settingsGetContentPrompt();
    if (!cp.hasPrompt) {
      setScheduleLog('Chưa có prompt nội dung — vào Cài đặt → Prompt nội dung.');
      return;
    }
    setRewriteDuplicatesLoading(true);
    setScheduleLog(null);
    try {
      const dupJobs = schedulePlan.jobs.filter((j) => j.isDuplicate);
      const items = dupJobs.map((j, idx) => ({
        key: `dup_${idx}`,
        text: j.description,
      }));
      const r = await reupRewriteCaptions(items);
      if (r.ok === false) {
        setScheduleLog(`Lỗi viết lại bản lặp: ${r.message}`);
        return;
      }
      const rewritten = new Map(r.items.map((it) => [it.key, it.text]));
      let applied = 0;
      const updatedJobs = schedulePlan.jobs.map((j, _idx) => {
        if (!j.isDuplicate) return j;
        const dupIdx = schedulePlan.jobs.filter((jj, ii) => jj.isDuplicate && ii <= _idx).length - 1;
        const key = `dup_${dupIdx}`;
        const newText = rewritten.get(key);
        if (newText) {
          applied++;
          return { ...j, description: newText, isDuplicate: false };
        }
        return j;
      });
      setSchedulePlan({ ...schedulePlan, jobs: updatedJobs, totalDuplicates: schedulePlan.totalDuplicates - applied });
      const failCount = r.failed?.length ?? 0;
      setScheduleLog(
        `Đã viết lại ${applied} caption bản lặp.${failCount > 0 ? ` Lỗi ${failCount}.` : ''}`,
      );
    } finally {
      setRewriteDuplicatesLoading(false);
    }
  }, [schedulePlan, openRouter?.hasApiKey]);

  const onSchedule = async (e: FormEvent) => {
    e.preventDefault();
    const plan = schedulePlan ?? buildPlan();
    if (!plan || plan.jobs.length === 0) {
      setScheduleLog('Không có job nào để lên lịch.');
      return;
    }

    setScheduleLog(null);
    setScheduleProgress(null);
    const pageNameById: Record<string, string> = {};
    for (const p of pages) {
      pageNameById[p.id] = p.name;
    }
    const payload = plan.jobs.map((j) => ({
      videoKey: j.videoKey,
      targetPageId: j.targetPageId,
      targetPageName: pageNameById[j.targetPageId] ?? j.targetPageId,
      pageAccessToken: j.pageAccessToken,
      fileUrl: j.fileUrl,
      description: j.description,
      scheduledPublishTime: j.scheduledPublishTime,
    }));
    setScheduleLoading(true);
    const unsubProgress = subscribeReupScheduleProgress(setScheduleProgress);
    try {
      const res = await reupScheduleVideos(payload);
      const ok = res.jobs.filter((x) => x.ok).length;
      const fail = res.jobs.length - ok;
      const lines = res.jobs
        .filter((x): x is ReupScheduleJobErr => x.ok === false)
        .map((x) => `${x.videoKey} → ${x.targetPageId}: ${x.message}`);
      setScheduleLog(
        `Hoàn tất: ${ok} thành công, ${fail} lỗi.${lines.length ? `\n${lines.slice(0, 8).join('\n')}` : ''}`,
      );
    } finally {
      unsubProgress();
      setScheduleLoading(false);
    }
  };

  const previewVideo = previewKey
    ? flatVideos.find((v) => videoKey(v) === previewKey)
    : null;

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-8 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold text-white">Reup video hàng loạt</h1>
        <p className="mt-2 max-w-4xl text-sm text-slate-400">
          Lấy video từ Page nguồn (Graph API), chọn Page đích của bạn, hẹn giờ đăng (
          <code className="text-slate-500">published=false</code> +{' '}
          <code className="text-slate-500">scheduled_publish_time</code>). Cần quyền phù hợp
          trên token (ví dụ đọc video Page khác, đăng lên Page bạn quản trị).
        </p>
        <ol className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          {[1, 2, 3, 4].map((s) => (
            <li
              key={s}
              className={
                step === s
                  ? 'rounded-full bg-blue-500/20 px-3 py-1 text-blue-200'
                  : 'rounded-full px-3 py-1'
              }
            >
              {s}. {s === 1 && 'Nguồn'}
              {s === 2 && 'Chọn video'}
              {s === 3 && 'Page đích'}
              {s === 4 && 'Khung giờ & chạy'}
            </li>
          ))}
        </ol>
      </div>

      {step === 1 && (
        <form onSubmit={(e) => void onFetch(e)} className="max-w-3xl space-y-4">
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            Link Fanpage nguồn (mỗi dòng một URL)
          </label>
          <textarea
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
            rows={10}
            placeholder="https://www.facebook.com/vnexpress&#10;https://www.facebook.com/profile.php?id=61577182247284"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {fetchError && (
            <p className="text-sm text-red-400/90" role="alert">
              {fetchError}
            </p>
          )}
          <button
            type="submit"
            disabled={fetchLoading}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {fetchLoading ? 'Đang tải…' : 'Tải danh sách video'}
          </button>
          {fetchPages.length > 0 && (
            <ul className="space-y-2 text-sm text-slate-400">
              {fetchPages.map((r, i) => (
                <li key={i}>
                  {r.ok === true ? (
                    <span className="text-emerald-400/90">
                      ✓ {r.inputLabel.slice(0, 60)}… → {r.videos.length} video
                    </span>
                  ) : (
                    <span className="text-red-400/80">
                      ✗ {r.inputLabel.slice(0, 60)}… — {r.message}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={selectAllVideos}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={clearVideoSelection}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              disabled={selectedKeys.size === 0}
              onClick={goStep3}
              className="ml-auto rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Tiếp — Page đích ({selectedKeys.size} video)
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Đã tải {flatVideos.length} video. Click thumbnail để xem trước (nếu URL cho phép).
          </p>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {flatVideos.map((v) => {
              const k = videoKey(v);
              const sel = selectedKeys.has(k);
              const thumbs = v.thumbnails.length
                ? v.thumbnails
                : v.picture
                  ? [v.picture]
                  : [];
              return (
                <li
                  key={k}
                  className={`flex gap-3 rounded-xl border p-3 transition ${
                    sel ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sel}
                    onChange={() => toggleKey(k)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex gap-2">
                      {thumbs.slice(0, 3).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setPreviewKey(k)}
                          className="h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-700"
                        >
                          <img src={u} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <p className="line-clamp-2 text-sm font-medium text-slate-100">
                      {v.sourcePageName}
                    </p>
                    <p className="line-clamp-2 text-xs text-slate-500">
                      {(descByKey[k] ?? v.description).trim() || '(Không mô tả)'}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span>View: {formatInt(v.views)}</span>
                      {v.permalinkUrl && (
                        <a
                          href={v.permalinkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Facebook
                        </a>
                      )}
                      {v.sourceUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewKey(k)}
                          className="text-violet-400 hover:text-violet-300"
                        >
                          Xem MP4
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300"
            >
              ← Video
            </button>
            <button
              type="button"
              onClick={selectAllTargets}
              disabled={loadStatus !== 'ready' || pages.length === 0}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300"
            >
              Chọn tất cả page
            </button>
            <button
              type="button"
              onClick={() => setTargetPageIds(new Set())}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300"
            >
              Bỏ chọn page
            </button>
            <button
              type="button"
              disabled={targetPageIds.size === 0}
              onClick={goStep4}
              className="ml-auto rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Tiếp — Lịch đăng ({targetPageIds.size} page)
            </button>
          </div>
          <input
            type="search"
            value={pageSearch}
            onChange={(e) => setPageSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc ID…"
            className="max-w-md rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
          />
          <ul className="grid max-h-[50vh] grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
            {filteredPages.map((p) => (
              <li
                key={p.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                  targetPageIds.has(p.id)
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-slate-800'
                }`}
                onClick={() => toggleTargetPage(p.id)}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={targetPageIds.has(p.id)}
                  className="pointer-events-none"
                />
                {p.pictureUrl ? (
                  <img
                    src={p.pictureUrl}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-xs">
                    {p.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{p.name}</p>
                  <p className="font-mono text-xs text-slate-500">{p.id}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 4 && (
        <div className="max-w-2xl space-y-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300"
            >
              ← Page đích
            </button>
          </div>
          {remixPipelineOn && (
            <div
              className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90"
              role="status"
            >
              <strong className="font-medium text-amber-200">Remix FFmpeg đang bật</strong>
              <p className="mt-1 text-xs leading-relaxed text-amber-100/75">
                Mỗi video sẽ được tải về máy, xử lý rồi đăng bằng file (multipart). Chậm hơn đăng
                trực tiếp bằng URL; song song tối đa 2 job. Cấu hình tại Cài đặt → Remix video.
              </p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Khung giờ trong ngày (local)
            </label>
            <textarea
              value={slotsText}
              onChange={(e) => setSlotsText(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-600">
              Mỗi page sẽ đăng đủ {parseTimeSlotsInput(slotsText)?.length ?? '?'} bài/ngày. Video xoay
              vòng khi hết; bài lặp nên viết lại nội dung AI. Tối thiểu 10 phút sau giờ hiện tại.
            </p>
          </div>
          {/* Plan summary */}
          {schedulePlan && schedulePlan.totalJobs > 0 && (
            <div className="rounded-xl border border-indigo-500/25 bg-indigo-950/20 px-4 py-3">
              <p className="text-sm font-medium text-indigo-200">Kế hoạch phân bổ</p>
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-slate-500">Tổng job: </span>
                  <span className="font-semibold text-white">{schedulePlan.totalJobs}</span>
                </div>
                <div>
                  <span className="text-slate-500">Số ngày: </span>
                  <span className="font-semibold text-white">{schedulePlan.totalDays}</span>
                </div>
                <div>
                  <span className="text-slate-500">Mỗi page: </span>
                  <span className="font-semibold text-white">{schedulePlan.slotsPerPage} bài</span>
                </div>
                <div>
                  <span className="text-slate-500">Bài/ngày/page: </span>
                  <span className="font-semibold text-white">{schedulePlan.slotsPerDay}</span>
                </div>
              </div>
              {schedulePlan.totalDuplicates > 0 && (
                <p className="mt-2 text-xs text-amber-300/80">
                  {schedulePlan.totalDuplicates} bài lặp (video tái sử dụng) — nên viết lại nội dung bằng AI trước khi đăng.
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={rewriteLoading || selectedKeys.size === 0}
              onClick={() => void onRewrite()}
              className="rounded-xl border border-violet-500/50 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 disabled:opacity-40"
            >
              {rewriteLoading ? 'Đang viết lại…' : 'Viết lại caption (AI)'}
            </button>
            {rewriteFailedKeys.length > 0 && !rewriteLoading && (
              <button
                type="button"
                onClick={() => void onRetryFailed()}
                className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20"
              >
                Viết lại {rewriteFailedKeys.length} caption lỗi
              </button>
            )}
            {schedulePlan && schedulePlan.totalDuplicates > 0 && !rewriteLoading && !rewriteDuplicatesLoading && (
              <button
                type="button"
                onClick={() => void onRewriteDuplicates()}
                className="rounded-xl border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
              >
                Viết lại nội dung {schedulePlan.totalDuplicates} bản lặp (AI)
              </button>
            )}
            {rewriteDuplicatesLoading && (
              <span className="self-center text-xs text-cyan-400/80">Đang viết lại bản lặp…</span>
            )}
          </div>
          <form onSubmit={(e) => void onSchedule(e)} className="space-y-4">
            <button
              type="submit"
              disabled={scheduleLoading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {scheduleLoading ? 'Đang gửi lịch…' : 'Setup — hẹn giờ đăng'}
            </button>
          </form>
          {scheduleProgress && scheduleProgress.total > 0 && (
            <div
              className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/70 p-4"
              aria-live="polite"
              aria-busy={scheduleLoading}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-300">
                  Tiến độ đăng lịch
                  {scheduleLoading ? (
                    <span className="ml-2 font-normal text-blue-300/90">· đang chạy…</span>
                  ) : (
                    <span className="ml-2 font-normal text-slate-500">· hoàn tất</span>
                  )}
                </span>
                <span className="font-mono text-slate-500">
                  {scheduleProgress.completed}/{scheduleProgress.total} · ✓{' '}
                  {scheduleProgress.successCount} · ✗ {scheduleProgress.failCount}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-[width] duration-200 ease-out"
                  style={{
                    width: `${Math.min(
                      100,
                      (scheduleProgress.completed / scheduleProgress.total) * 100,
                    )}%`,
                  }}
                />
              </div>
              {scheduleLoading && scheduleProgress.completed === 0 ? (
                <p className="text-xs text-slate-500">
                  Đang kết nối Graph và xếp hàng đăng video…
                </p>
              ) : scheduleProgress.videoKey != null ? (
                <p className="break-all font-mono text-[11px] leading-relaxed text-slate-500">
                  <span className="text-slate-400">
                    {scheduleLoading ? 'Vừa xử lý:' : 'Cuối cùng:'}
                  </span>{' '}
                  {scheduleProgress.videoKey}
                  <span className="text-slate-600"> → </span>
                  <span className="text-slate-500">page {scheduleProgress.targetPageId}</span>
                  {scheduleProgress.ok === true ? (
                    <span className="text-emerald-400/90"> · thành công</span>
                  ) : scheduleProgress.ok === false ? (
                    <span className="text-red-400/85"> · lỗi</span>
                  ) : null}
                  {scheduleProgress.ok === false && scheduleProgress.message ? (
                    <span className="block pt-1 text-red-400/70">
                      {scheduleProgress.message}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>
          )}
          {scheduleLog && (
            <pre className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-300">
              {scheduleLog}
            </pre>
          )}
        </div>
      )}

      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal
          onClick={() => setPreviewKey(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setPreviewKey(null);
            }
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-700 bg-slate-950 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex justify-between gap-2">
              <p className="truncate text-sm font-medium text-white">
                {previewVideo.sourcePageName}
              </p>
              <button
                type="button"
                onClick={() => setPreviewKey(null)}
                className="rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-300"
              >
                Đóng
              </button>
            </div>
            {previewVideo.sourceUrl ? (
              <video
                autoPlay
                src={previewVideo.sourceUrl}
                controls
                className="max-h-[70vh] w-full rounded-lg bg-black"
              />
            ) : (
              <p className="text-sm text-slate-500">Không có URL nguồn MP4.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
