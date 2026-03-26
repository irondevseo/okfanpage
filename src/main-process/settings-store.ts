import type {
  ContentPromptPublicSettings,
  ContentPromptSetPayload,
} from '../shared/settings-types';
import { DEFAULT_OPENROUTER_MODEL_ID } from '../shared/settings-types';
import { createTypedStore } from './typed-store';

type OpenRouterStored = {
  modelId: string;
  apiKey: string;
};

type SettingsSchema = {
  openRouter?: OpenRouterStored;
  contentPrompt?: string;
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
