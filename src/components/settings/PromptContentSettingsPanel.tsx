import { FormEvent, useEffect, useState } from 'react';
import {
  settingsGetContentPrompt,
  settingsSetContentPrompt,
} from '../../services/settingsClient';

export function PromptContentSettingsPanel() {
  const [promptDraft, setPromptDraft] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await settingsGetContentPrompt();
      setPromptDraft(s.prompt);
      setReady(true);
    })();
  }, []);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setSaving(true);
    try {
      await settingsSetContentPrompt({ prompt: promptDraft });
      setMsg('Đã lưu prompt.');
    } catch {
      setErr('Không lưu được.');
    } finally {
      setSaving(false);
    }
  };

  const onClear = async () => {
    setMsg(null);
    setErr(null);
    setSaving(true);
    try {
      await settingsSetContentPrompt({ clearPrompt: true });
      setPromptDraft('');
      setMsg('Đã xóa prompt.');
    } catch {
      setErr('Không xóa được.');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <p className="text-sm text-slate-500">Đang tải…</p>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Prompt nội dung (reup)</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Hướng dẫn cho AI (OpenRouter) khi viết lại mô tả video trước khi hẹn giờ đăng.
          Ví dụ: giọng văn, độ dài, hashtag, tránh từ khóa, v.v.
        </p>
      </div>

      <form onSubmit={(e) => void onSave(e)} className="max-w-3xl space-y-4">
        <textarea
          value={promptDraft}
          onChange={(e) => setPromptDraft(e.target.value)}
          rows={12}
          placeholder="Bạn là copywriter… Viết lại mô tả ngắn gọn, thân thiện, thêm 2–3 hashtag phù hợp…"
          className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
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
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Đang lưu…' : 'Lưu prompt'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void onClear()}
            className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Xóa prompt
          </button>
        </div>
      </form>
    </div>
  );
}
