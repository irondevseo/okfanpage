import type {
  ContentPromptPublicSettings,
  ContentPromptSetPayload,
  ListOpenRouterModelsResult,
  OpenRouterPublicSettings,
  OpenRouterSetPayload,
} from '../shared/settings-types';

function api() {
  if (typeof window === 'undefined' || !window.electronAPI) {
    throw new Error('Chỉ chạy trong Electron.');
  }
  return window.electronAPI;
}

export async function settingsGetOpenRouter(): Promise<OpenRouterPublicSettings> {
  return api().settings.getOpenRouter();
}

export async function settingsSetOpenRouter(
  payload: OpenRouterSetPayload,
): Promise<OpenRouterPublicSettings> {
  return api().settings.setOpenRouter(payload);
}

export async function openrouterListModels(
  apiKey?: string,
): Promise<ListOpenRouterModelsResult> {
  return api().openrouter.listModels(apiKey);
}

export async function settingsGetContentPrompt(): Promise<ContentPromptPublicSettings> {
  return api().settings.getContentPrompt();
}

export async function settingsSetContentPrompt(
  payload: ContentPromptSetPayload,
): Promise<ContentPromptPublicSettings> {
  return api().settings.setContentPrompt(payload);
}
