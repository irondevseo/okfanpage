export const DEFAULT_OPENROUTER_MODEL_ID = 'openai/gpt-4o-mini';

export type OpenRouterModelOption = {
  id: string;
  name: string;
};

export type OpenRouterPublicSettings = {
  modelId: string;
  hasApiKey: boolean;
};

export type OpenRouterSetPayload = {
  modelId?: string;
  /** Chỉ gửi khi người dùng nhập key mới (không gửi khi để trống = giữ key cũ). */
  apiKey?: string;
  clearApiKey?: boolean;
};

export type ListOpenRouterModelsResult =
  | { ok: true; models: OpenRouterModelOption[] }
  | { ok: false; message: string };

export type ContentPromptPublicSettings = {
  prompt: string;
  hasPrompt: boolean;
};

export type ContentPromptSetPayload = {
  prompt?: string;
  clearPrompt?: boolean;
};
