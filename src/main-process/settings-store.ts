import type {
  ContentPromptPublicSettings,
  ContentPromptSetPayload,
  ReupRemixPublicSettings,
  ReupRemixSetPayload,
} from '../shared/settings-types';
import {
  DEFAULT_OPENROUTER_MODEL_ID,
  DEFAULT_REUP_REMIX_SETTINGS,
} from '../shared/settings-types';
import { createTypedStore } from './typed-store';

type OpenRouterStored = {
  modelId: string;
  apiKey: string;
};

type SettingsSchema = {
  openRouter?: OpenRouterStored;
  contentPrompt?: string;
  reupRemix?: Partial<ReupRemixPublicSettings>;
};

const store = createTypedStore<SettingsSchema>({
  name: 'okfanpage-settings',
  defaults: {
    openRouter: {
      modelId: DEFAULT_OPENROUTER_MODEL_ID,
      apiKey: '',
    },
  },
});

export function getOpenRouterPublic(): {
  modelId: string;
  hasApiKey: boolean;
} {
  const v = store.get('openRouter');
  return {
    modelId: v?.modelId?.trim() || DEFAULT_OPENROUTER_MODEL_ID,
    hasApiKey: Boolean(v?.apiKey?.trim()),
  };
}

/** Dùng trong main khi gọi OpenRouter — không gửi renderer. */
export function getOpenRouterSecrets(): {
  modelId: string;
  apiKey: string;
} | null {
  const v = store.get('openRouter');
  const key = v?.apiKey?.trim();
  if (!key) {
    return null;
  }
  return {
    modelId: v?.modelId?.trim() || DEFAULT_OPENROUTER_MODEL_ID,
    apiKey: key,
  };
}

export function setOpenRouter(patch: {
  modelId?: string;
  apiKey?: string;
  clearApiKey?: boolean;
}): void {
  const cur = store.get('openRouter') ?? {
    modelId: DEFAULT_OPENROUTER_MODEL_ID,
    apiKey: '',
  };
  let apiKey = cur.apiKey ?? '';
  if (patch.clearApiKey) {
    apiKey = '';
  } else if (typeof patch.apiKey === 'string' && patch.apiKey.trim() !== '') {
    apiKey = patch.apiKey.trim();
  }
  const modelId =
    patch.modelId !== undefined
      ? patch.modelId.trim() || DEFAULT_OPENROUTER_MODEL_ID
      : cur.modelId || DEFAULT_OPENROUTER_MODEL_ID;
  store.set('openRouter', { modelId, apiKey });
}

export function getContentPromptPublic(): ContentPromptPublicSettings {
  const p = store.get('contentPrompt');
  const prompt = typeof p === 'string' ? p : '';
  return {
    prompt,
    hasPrompt: Boolean(prompt.trim()),
  };
}

export function getContentPromptText(): string {
  const p = store.get('contentPrompt');
  return typeof p === 'string' ? p.trim() : '';
}

export function setContentPrompt(payload: ContentPromptSetPayload): void {
  if (payload.clearPrompt) {
    store.set('contentPrompt', '');
    return;
  }
  if (typeof payload.prompt === 'string') {
    store.set('contentPrompt', payload.prompt);
  }
}

export function getReupRemixSettings(): ReupRemixPublicSettings {
  const raw = store.get('reupRemix');
  const patch =
    raw && typeof raw === 'object' ? (raw as Partial<ReupRemixPublicSettings>) : {};
  return { ...DEFAULT_REUP_REMIX_SETTINGS, ...patch };
}

export function setReupRemix(payload: ReupRemixSetPayload): ReupRemixPublicSettings {
  const cur = getReupRemixSettings();
  const next: ReupRemixPublicSettings = { ...cur, ...payload };
  store.set('reupRemix', next);
  return next;
}
