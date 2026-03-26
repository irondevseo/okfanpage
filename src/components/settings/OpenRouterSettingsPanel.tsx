import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
  openrouterListModels,
  settingsSetOpenRouter,
} from '../../services/settingsClient';
import {
  DEFAULT_OPENROUTER_MODEL_ID,
  type OpenRouterModelOption,
} from '../../shared/settings-types';

const FALLBACK_MODELS: OpenRouterModelOption[] = [
  { id: 'openai/gpt-4o-mini', name: 'OpenAI: GPT-4o mini' },
  { id: 'openai/gpt-4o', name: 'OpenAI: GPT-4o' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic: Claude 3.5 Sonnet' },
  { id: 'anthropic/claude-3-haiku', name: 'Anthropic: Claude 3 Haiku' },
  { id: 'google/gemini-pro-1.5', name: 'Google: Gemini Pro 1.5' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta: Llama 3.3 70B' },
];

export function OpenRouterSettingsPanel() {
  const { openRouter, openRouterReady, refreshOpenRouter } = useSettings();
  const [modelId, setModelId] = useState(DEFAULT_OPENROUTER_MODEL_ID);
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [models, setModels] = useState<OpenRouterModelOption[]>(FALLBACK_MODELS);
  const [modelsFromApi, setModelsFromApi] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadModels = useCallback(async (optionalKey?: string) => {
    setModelsLoading(true);
    try {
      const r = await openrouterListModels(optionalKey?.trim() || undefined);
      if (r.ok && r.models.length > 0) {
        setModels(r.models);
        setModelsFromApi(true);
      } else {
        setModels(FALLBACK_MODELS);
        setModelsFromApi(false);
      }
    } finally {
      setModelsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadModels();
  }, [loadModels]);

  useEffect(() => {
    if (openRouterReady && openRouter) {
      setModelId(openRouter.modelId);
    }
  }, [openRouter, openRouterReady]);

  const filteredModels = models.filter(
    (m) =>
      !filter.trim() ||
      m.id.toLowerCase().includes(filter.toLowerCase()) ||
      m.name.toLowerCase().includes(filter.toLowerCase()),
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    setSaveError(null);
    setSaving(true);
    try {
      const payload: {
        modelId: string;
        apiKey?: string;
      } = { modelId };
      if (apiKeyDraft.trim()) {
        payload.apiKey = apiKeyDraft.trim();
      }
      await settingsSetOpenRouter(payload);
      setApiKeyDraft('');
      await refreshOpenRouter();
      setSaveMessage('Đã lưu cấu hình OpenRouter.');
    } catch {
      setSaveError('Không lưu được. Thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const onClearKey = async () => {
    setSaveMessage(null);
    setSaveError(null);
    setSaving(true);
    try {
      await settingsSetOpenRouter({ clearApiKey: true, modelId });
      setApiKeyDraft('');
      await refreshOpenRouter();
      setSaveMessage('Đã gỡ API key.');
    } catch {
      setSaveError('Không gỡ được key.');
    } finally {
      setSaving(false);
    }
  };

  if (!openRouterReady || !openRouter) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500"
          aria-hidden
        />
        Đang tải cài đặt…
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">API AI — OpenRouter</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          Chọn model và nhập API key từ{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            OpenRouter
          </a>
          . Cấu hình dùng chung cho các tính năng gọi AI trong app (endpoint{' '}
          <code className="rounded bg-slate-800 px-1 py-0.5 text-xs text-slate-300">
            https://openrouter.ai/api/v1
          </code>
          ).
        </p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="max-w-2xl space-y-6">
        <div>
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
            <label
              htmlFor="or-model-filter"
              className="block text-xs font-medium uppercase tracking-wider text-slate-500"
            >
              Model
            </label>
            <button
              type="button"
              onClick={() => void loadModels(apiKeyDraft)}
              disabled={modelsLoading}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50"
            >
              {modelsLoading ? 'Đang tải danh sách…' : 'Tải lại danh sách model'}
            </button>
          </div>
          <p className="mb-2 text-xs text-slate-600">
            {modelsFromApi
              ? 'Danh sách từ OpenRouter.'
              : 'Đang dùng danh sách gợi ý — bấm “Tải lại” (có thể dán key trước để lấy đủ model).'}
          </p>
          <input
            id="or-model-filter"
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Lọc theo tên hoặc id…"
            className="mb-2 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            id="or-model"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            size={Math.min(12, Math.max(4, filteredModels.length || 1))}
            className="max-h-72 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 font-mono text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {!models.some((m) => m.id === modelId) && (
              <option value={modelId}>{modelId} (đang chọn)</option>
            )}
            {filteredModels.length === 0 ? (
              <option value={modelId}>
                Không có model khớp lọc — xóa ô lọc hoặc đổi từ khóa
              </option>
            ) : (
              filteredModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="or-key"
            className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
          >
            API key
          </label>
          <input
            id="or-key"
            type="password"
            autoComplete="off"
            value={apiKeyDraft}
            onChange={(e) => setApiKeyDraft(e.target.value)}
            placeholder={
              openRouter.hasApiKey
                ? '•••••••• (đã lưu — nhập key mới để thay)'
                : 'sk-or-v1-…'
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-2 text-xs text-slate-600">
            Key chỉ lưu trên máy bạn (electron-store). Để trống khi lưu nếu chỉ đổi
            model và giữ key cũ.
          </p>
        </div>

        {saveMessage && (
          <p
            role="status"
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200/90"
          >
            {saveMessage}
          </p>
        )}
        {saveError && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200/90"
          >
            {saveError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
          >
            {saving ? 'Đang lưu…' : 'Lưu cấu hình'}
          </button>
          <button
            type="button"
            disabled={saving || !openRouter.hasApiKey}
            onClick={() => void onClearKey()}
            className="rounded-xl border border-slate-600 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Gỡ API key
          </button>
        </div>
      </form>
    </div>
  );
}
