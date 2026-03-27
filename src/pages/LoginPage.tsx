import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ViaProfileSummary } from '../shared/auth-types';
import { authDeleteVia, authListViaProfiles } from '../services/authClient';

const APP_NAME = 'okfanpage';

export function LoginPage() {
  const {
    profile,
    status,
    bootMessage,
    canRetryWithStoredCookies,
    login,
    switchVia,
    retryRestore,
  } = useAuth();
  const [cookieInput, setCookieInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viaList, setViaList] = useState<ViaProfileSummary[]>([]);
  const [selectedViaId, setSelectedViaId] = useState('');
  const [viaSwitching, setViaSwitching] = useState(false);
  const [viaDeleting, setViaDeleting] = useState(false);

  const refreshViaList = useCallback(async () => {
    try {
      const list = await authListViaProfiles();
      setViaList(list);
    } catch {
      setViaList([]);
    }
  }, []);

  useEffect(() => {
    void refreshViaList();
  }, [refreshViaList]);

  useEffect(() => {
    if (
      selectedViaId &&
      !viaList.some((v) => v.id === selectedViaId)
    ) {
      setSelectedViaId('');
    }
  }, [viaList, selectedViaId]);

  if (status === 'boot') {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-slate-950">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500"
          aria-hidden
        />
      </div>
    );
  }

  if (profile) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const r = await login(cookieInput);
      if (r.ok === false) {
        setError(r.message);
        return;
      }
      await refreshViaList();
    } finally {
      setSubmitting(false);
    }
  };

  const onSwitchSavedVia = async () => {
    const id = selectedViaId.trim();
    if (!id) {
      return;
    }
    setError(null);
    setViaSwitching(true);
    try {
      const r = await switchVia(id);
      if (r.ok === false) {
        setError(r.message);
        await refreshViaList();
        setSelectedViaId('');
      }
    } finally {
      setViaSwitching(false);
    }
  };

  const onDeleteSelectedVia = async () => {
    const id = selectedViaId.trim();
    if (!id) {
      return;
    }
    setError(null);
    setViaDeleting(true);
    try {
      await authDeleteVia(id);
      setSelectedViaId('');
      await refreshViaList();
    } finally {
      setViaDeleting(false);
    }
  };

  const busy = submitting || viaSwitching || viaDeleting;

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.22),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-1/4 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-glow">
            <span className="text-xl font-bold tracking-tight text-white">
              OK
            </span>
          </div>
          <h1 className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Nhiều via (cookie) — chọn nhanh hoặc dán cookie mới
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-black/40 backdrop-blur-sm">
          {(bootMessage || error) && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90"
            >
              {error ?? bootMessage}
            </div>
          )}

          {canRetryWithStoredCookies && (
            <button
              type="button"
              onClick={() => void retryRestore()}
              className="mb-4 w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
            >
              Thử đăng nhập lại (cookie đã lưu)
            </button>
          )}

          {viaList.length > 0 && (
            <div className="mb-6 space-y-3 rounded-xl border border-slate-700/80 bg-slate-950/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Via đã lưu trên máy
              </p>
              <label htmlFor="via-select" className="sr-only">
                Chọn via
              </label>
              <select
                id="via-select"
                value={selectedViaId}
                onChange={(e) => setSelectedViaId(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">— Chọn via —</option>
                {viaList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                    {v.isActive ? ' (đang chọn trước đó)' : ''}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!selectedViaId || busy}
                  onClick={() => void onSwitchSavedVia()}
                  className="flex-1 min-w-[140px] rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {viaSwitching ? 'Đang đăng nhập…' : 'Đăng nhập via này'}
                </button>
                <button
                  type="button"
                  disabled={!selectedViaId || busy}
                  onClick={() => void onDeleteSelectedVia()}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200/90 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {viaDeleting ? '…' : 'Gỡ via'}
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Cookie hết hạn sẽ bị xóa khỏi danh sách khi bạn đăng nhập via đó.
              </p>
            </div>
          )}

          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-600">
            Hoặc dán cookie
          </p>

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <div>
              <label
                htmlFor="fb-cookies"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                Cookie Facebook
              </label>
              <textarea
                id="fb-cookies"
                value={cookieInput}
                onChange={(e) => setCookieInput(e.target.value)}
                placeholder="Dán chuỗi cookie từ trình duyệt…"
                rows={6}
                spellCheck={false}
                disabled={busy}
                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !cookieInput.trim()}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Đang xác thực…' : 'Đăng nhập & lưu via'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-600">
          Cookie lưu cục bộ theo từng via. Đăng xuất chỉ thoát phiên hiện tại — danh
          sách via vẫn giữ trừ khi bạn gỡ.
        </p>
      </div>
    </div>
  );
}
