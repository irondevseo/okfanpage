import { BrowserWindow, dialog, ipcMain } from 'electron';
import type {
  ContentPromptPublicSettings,
  ContentPromptSetPayload,
  ListOpenRouterModelsResult,
  OpenRouterPublicSettings,
  OpenRouterSetPayload,
  ReupRemixPublicSettings,
  ReupRemixSetPayload,
} from '../shared/settings-types';
import { fetchOpenRouterModels } from './openrouter-api';
import {
  getContentPromptPublic,
  getOpenRouterPublic,
  getReupRemixSettings,
  setContentPrompt,
  setOpenRouter,
  setReupRemix,
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
    'settings:getReupRemix',
    async (): Promise<ReupRemixPublicSettings> => {
      return getReupRemixSettings();
    },
  );

  ipcMain.handle(
    'settings:setReupRemix',
    async (
      _e,
      payload: ReupRemixSetPayload,
    ): Promise<ReupRemixPublicSettings> => {
      return setReupRemix(payload);
    },
  );

  ipcMain.handle(
    'settings:pickLogoFile',
    async (e): Promise<string | null> => {
      const win = BrowserWindow.fromWebContents(e.sender);
      const { canceled, filePaths } = await dialog.showOpenDialog(
        win ?? undefined,
        {
          title: 'Chọn ảnh logo (PNG khuyến nghị)',
          filters: [
            {
              name: 'Ảnh',
              extensions: ['png', 'jpg', 'jpeg', 'webp'],
            },
          ],
          properties: ['openFile'],
        },
      );
      if (canceled || !filePaths[0]) {
        return null;
      }
      return filePaths[0];
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
