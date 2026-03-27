import { FormEvent, useEffect, useState } from 'react';
import {
  settingsGetReupRemix,
  settingsPickLogoFile,
  settingsSetReupRemix,
} from '../../services/settingsClient';
import type {
  ReupOverlayPosition,
  ReupRemixPublicSettings,
} from '../../shared/settings-types';

const POSITIONS: { v: ReupOverlayPosition; label: string }[] = [
  { v: 'tl', label: 'Trên trái' },
  { v: 'tr', label: 'Trên phải' },
  { v: 'bl', label: 'Dưới trái' },
  { v: 'br', label: 'Dưới phải' },
  { v: 'center', label: 'Giữa' },
];

export function ReupRemixSettingsPanel() {
  const [draft, setDraft] = useState<ReupRemixPublicSettings | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await settingsGetReupRemix();
      setDraft(s);
      setReady(true);
    })();
  }, []);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft) {
      return;
    }
    setMsg(null);
    setErr(null);
    setSaving(true);
    try {
      const saved = await settingsSetReupRemix(draft);
      setDraft(saved);
      setMsg('Đã lưu cấu hình remix.');
    } catch {
      setErr('Không lưu được.');
    } finally {
      setSaving(false);
    }
  };

  const onPickLogo = async () => {
    const p = await settingsPickLogoFile();
    if (p && draft) {
      setDraft({ ...draft, logoPath: p });
    }
  };

  if (!ready || !draft) {
    return <p className="text-sm text-slate-500">Đang tải…</p>;
  }

  const set = (patch: Partial<ReupRemixPublicSettings>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  };

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Cấu hình reup video (FFmpeg)</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Khi bật, mỗi lần hẹn giờ đăng: app tải MP4 về máy, chạy FFmpeg theo tùy chọn bên dưới, rồi
          upload lên Graph bằng <code className="text-slate-500">multipart source</code> (khác với
          đăng trực tiếp bằng URL nguồn). Tốn CPU/đĩa và chậm hơn — phù hợp khi cần chỉnh sửa nhẹ
          trước khi đăng.
        </p>
      </div>

      <form onSubmit={(e) => void onSave(e)} className="max-w-3xl space-y-8">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(e) => set({ enabled: e.target.checked })}
            className="mt-1"
          />
          <span>
            <span className="font-medium text-slate-200">Bật pipeline remix trước khi đăng</span>
            <span className="mt-1 block text-xs text-slate-500">
              Tắt = giữ hành vi cũ (Graph <code className="text-slate-600">file_url</code>).
            </span>
          </span>
        </label>

        <fieldset
          disabled={!draft.enabled}
          className="space-y-6 rounded-xl border border-slate-800/80 p-5 disabled:opacity-50"
        >
          <legend className="px-1 text-sm font-medium text-slate-300">
            Hình ảnh & nhịp cắt
          </legend>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={draft.hflip}
              onChange={(e) => set({ hflip: e.target.checked })}
            />
            Lật ngang (mirror)
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Độ sáng (−0.35 … 0.35)
              </label>
              <input
                type="number"
                step="0.05"
                min={-0.35}
                max={0.35}
                value={draft.brightness}
                onChange={(e) => set({ brightness: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Bão hòa (0.6 … 1.6)
              </label>
              <input
                type="number"
                step="0.05"
                min={0.6}
                max={1.6}
                value={draft.saturation}
                onChange={(e) => set({ saturation: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Tốc độ phát sau remix (1 = gốc)
            </label>
            <input
              type="number"
              step="0.05"
              min={0.25}
              max={4}
              value={draft.playbackSpeed}
              onChange={(e) =>
                set({
                  playbackSpeed: Math.max(
                    0.25,
                    Math.min(4, Number(e.target.value) || 1),
                  ),
                })
              }
              className="mt-1 w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
            <p className="mt-1 text-xs text-slate-600">
              Ví dụ 0.8 chậm hơn, 1.25 nhanh hơn. Âm thanh chỉnh bằng atempo khi bạn giữ track gốc.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Cắt nhịp — mỗi N giây (0 = tắt)
              </label>
              <input
                type="number"
                step="1"
                min={0}
                max={120}
                value={draft.jumpEverySeconds}
                onChange={(e) =>
                  set({ jumpEverySeconds: Math.max(0, Number(e.target.value)) })
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Bỏ đoạn đầu mỗi chu kỳ (giây)
              </label>
              <input
                type="number"
                step="0.05"
                min={0}
                max={5}
                value={draft.jumpSkipSeconds}
                onChange={(e) =>
                  set({ jumpSkipSeconds: Math.max(0, Number(e.target.value)) })
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Ví dụ 5 + 0.15: cứ mỗi 5 giây timeline, bỏ 0.15 giây đầu chu kỳ (audio đồng bộ nếu giữ
            âm thanh).
          </p>
        </fieldset>

        <fieldset
          disabled={!draft.enabled}
          className="space-y-4 rounded-xl border border-slate-800/80 p-5 disabled:opacity-50"
        >
          <legend className="px-1 text-sm font-medium text-slate-300">Watermark chữ</legend>
          <input
            type="text"
            value={draft.watermarkText}
            onChange={(e) => set({ watermarkText: e.target.value })}
            placeholder="Để trống = không chèn chữ"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-500">Độ mờ (0–1)</label>
              <input
                type="number"
                step="0.05"
                min={0}
                max={1}
                value={draft.watermarkOpacity}
                onChange={(e) => set({ watermarkOpacity: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Cỡ chữ (× so với mặc định h÷32)</label>
              <input
                type="number"
                step="0.05"
                min={0.25}
                max={4}
                value={draft.watermarkFontScale}
                onChange={(e) =>
                  set({
                    watermarkFontScale: Math.max(
                      0.25,
                      Math.min(4, Number(e.target.value) || 1),
                    ),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500">Vị trí</label>
              <select
                value={draft.watermarkPosition}
                onChange={(e) =>
                  set({ watermarkPosition: e.target.value as ReupOverlayPosition })
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                {POSITIONS.map((p) => (
                  <option key={p.v} value={p.v}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={draft.watermarkAnimate}
              onChange={(e) => set({ watermarkAnimate: e.target.checked })}
            />
            Chữ chuyển động theo chữ X (góc trên-trái ↔ dưới-phải, rồi trên-phải ↔ dưới-trái)
          </label>
        </fieldset>

        <fieldset
          disabled={!draft.enabled}
          className="space-y-4 rounded-xl border border-slate-800/80 p-5 disabled:opacity-50"
        >
          <legend className="px-1 text-sm font-medium text-slate-300">Logo ảnh</legend>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void onPickLogo()}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200"
            >
              Chọn file logo…
            </button>
            <button
              type="button"
              onClick={() => set({ logoPath: '' })}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400"
            >
              Xóa logo
            </button>
          </div>
          {draft.logoPath ? (
            <p className="break-all font-mono text-xs text-slate-500">{draft.logoPath}</p>
          ) : (
            <p className="text-xs text-slate-600">Chưa chọn — PNG trong suốt khuyến nghị.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-500">Độ mờ logo (0–1)</label>
              <input
                type="number"
                step="0.05"
                min={0}
                max={1}
                value={draft.logoOpacity}
                onChange={(e) => set({ logoOpacity: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Chiều rộng logo (px, scale trong FFmpeg)</label>
              <input
                type="number"
                step="4"
                min={32}
                max={640}
                value={draft.logoWidthPx}
                onChange={(e) =>
                  set({
                    logoWidthPx: Math.max(
                      32,
                      Math.min(640, Math.round(Number(e.target.value)) || 120),
                    ),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500">Vị trí</label>
              <select
                value={draft.logoPosition}
                onChange={(e) =>
                  set({ logoPosition: e.target.value as ReupOverlayPosition })
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                {POSITIONS.map((p) => (
                  <option key={p.v} value={p.v}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={draft.logoAnimate}
              onChange={(e) => set({ logoAnimate: e.target.checked })}
            />
            Logo chuyển động theo chữ X (cùng kiểu với chữ)
          </label>
        </fieldset>

        <fieldset
          disabled={!draft.enabled}
          className="space-y-3 rounded-xl border border-dashed border-slate-700 p-5 disabled:opacity-40"
        >
          <legend className="px-1 text-sm font-medium text-slate-400">
            Chroma key (lưu sẵn — pipeline chưa encode)
          </legend>
          <p className="text-xs text-slate-600">
            Chọn màu nền cần xóa (thường là xanh lá). Giá trị được lưu; FFmpeg hiện chưa áp dụng chroma.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs text-slate-500">Màu chroma</label>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={
                    /^[0-9A-Fa-f]{6}$/.test(draft.chromaKeyHex)
                      ? `#${draft.chromaKeyHex}`
                      : '#00ff00'
                  }
                  onChange={(e) =>
                    set({
                      chromaKeyHex: e.target.value
                        .replace(/^#/, '')
                        .slice(0, 6)
                        .toUpperCase(),
                    })
                  }
                  className="h-9 w-14 cursor-pointer rounded-md border border-slate-600 bg-slate-900 p-0.5"
                  title="Chọn màu"
                  aria-label="Chọn màu chroma key"
                />
                <span className="min-w-0 font-mono text-xs text-slate-400">
                  {/^[0-9A-Fa-f]{6}$/.test(draft.chromaKeyHex)
                    ? `#${draft.chromaKeyHex.toUpperCase()}`
                    : '— chưa lưu'}
                </span>
                {draft.chromaKeyHex ? (
                  <button
                    type="button"
                    onClick={() => set({ chromaKeyHex: '' })}
                    className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800"
                  >
                    Xóa màu
                  </button>
                ) : null}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Similarity</label>
              <input
                type="number"
                step="0.02"
                min={0}
                max={1}
                value={draft.chromaKeySimilarity}
                onChange={(e) =>
                  set({ chromaKeySimilarity: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Blend</label>
              <input
                type="number"
                step="0.02"
                min={0}
                max={1}
                value={draft.chromaKeyBlend}
                onChange={(e) => set({ chromaKeyBlend: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </fieldset>

        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Âm thanh
          </label>
          <select
            value={draft.audioMode}
            onChange={(e) =>
              set({ audioMode: e.target.value as 'keep' | 'mute' })
            }
            disabled={!draft.enabled}
            className="mt-1 w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-50"
          >
            <option value="keep">Giữ (đồng bộ khi bật cắt nhịp)</option>
            <option value="mute">Tắt tiếng</option>
          </select>
        </div>

        {msg && (
          <p className="text-sm text-emerald-400/90" role="status">
            {msg}
          </p>
        )}
        {err && (
          <p className="text-sm text-red-400/90" role="alert">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Đang lưu…' : 'Lưu cấu hình remix'}
        </button>
      </form>
    </div>
  );
}
