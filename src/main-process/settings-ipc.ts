import { ipcMain } from 'electron';
import type {
  ContentPromptPublicSettings,
  ContentPromptSetPayload,
  ListOpenRouterModelsResult,
  OpenRouterPublicSettings,
  OpenRouterSetPayload,
} from '../shared/settings-types';
import { fetchOpenRouterModels } from './openrouter-api';
import {
  getContentPromptPublic,
  getOpenRouterPublic,
  setContentPrompt,
  setOpenRouter,
} from './settings-store';

export function registerSettingsIpc(): void {
  ipcMain.handle(
    'settings:getOpenRouter',
    async (): Promise<OpenRouterPublicSettings> => {
      return getOpenRouterPublic();
    },
  );

  ipcMain.handle(
    'settings:setOpenRouter',
    async (_e, payload: OpenRouterSetPayload): Promise<OpenRouterPublicSettings> => {
      setOpenRouter({
        modelId: payload.modelId,
        apiKey: payload.apiKey,
        clearApiKey: payload.clearApiKey,
      });
      return getOpenRouterPublic();
    },
  );

  ipcMain.handle(
    'settings:getContentPrompt',
    async (): Promise<ContentPromptPublicSettings> => {
      return getContentPromptPublic();
    },
  );

  ipcMain.handle(
    'settings:setContentPrompt',
    async (
      _e,
      payload: ContentPromptSetPayload,
    ): Promise<ContentPromptPublicSettings> => {
      setContentPrompt(payload);
      return getContentPromptPublic();
    },
  );

  ipcMain.handle(
    'openrouter:listModels',
    async (_e, apiKey?: string): Promise<ListOpenRouterModelsResult> => {
      try {
        const models = await fetchOpenRouterModels(
          typeof apiKey === 'string' ? apiKey : undefined,
        );
        return { ok: true, models };
      } catch {
        return {
          ok: false,
          message: 'Không tải được danh sách model OpenRouter.',
        };
      }
    },
  );
}
