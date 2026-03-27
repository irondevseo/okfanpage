import { contextBridge, ipcRenderer } from 'electron';
import type { AuthResult, FacebookRequestAuthResult } from './shared/auth-types';
import type { ListFanPagesResult } from './shared/fanpage-types';
import type {
  ContentPromptPublicSettings,
  ContentPromptSetPayload,
  ListOpenRouterModelsResult,
  OpenRouterPublicSettings,
  OpenRouterSetPayload,
} from './shared/settings-types';
import type {
  ReupFetchSourcesResult,
  ReupRewriteResult,
  ReupScheduleBatchResult,
  ReupScheduleJobPayload,
  ReupScheduleProgressPayload,
} from './shared/reup-types';

contextBridge.exposeInMainWorld('electronAPI', {
  auth: {
    restore: (): Promise<AuthResult> => ipcRenderer.invoke('auth:restore'),
    login: (cookies: string): Promise<AuthResult> =>
      ipcRenderer.invoke('auth:login', cookies),
    logout: (): Promise<void> => ipcRenderer.invoke('auth:logout'),
    validate: (): Promise<AuthResult> => ipcRenderer.invoke('auth:validate'),
    getFacebookRequestAuth: (): Promise<FacebookRequestAuthResult> =>
      ipcRenderer.invoke('auth:getFacebookRequestAuth'),
  },
  facebook: {
    listManagedPages: (): Promise<ListFanPagesResult> =>
      ipcRenderer.invoke('facebook:listManagedPages'),
  },
  settings: {
    getOpenRouter: (): Promise<OpenRouterPublicSettings> =>
      ipcRenderer.invoke('settings:getOpenRouter'),
    setOpenRouter: (
      payload: OpenRouterSetPayload,
    ): Promise<OpenRouterPublicSettings> =>
      ipcRenderer.invoke('settings:setOpenRouter', payload),
    getContentPrompt: (): Promise<ContentPromptPublicSettings> =>
      ipcRenderer.invoke('settings:getContentPrompt'),
    setContentPrompt: (
      payload: ContentPromptSetPayload,
    ): Promise<ContentPromptPublicSettings> =>
      ipcRenderer.invoke('settings:setContentPrompt', payload),
  },
  openrouter: {
    listModels: (apiKey?: string): Promise<ListOpenRouterModelsResult> =>
      ipcRenderer.invoke('openrouter:listModels', apiKey),
  },
  reup: {
    fetchSources: (text: string): Promise<ReupFetchSourcesResult> =>
      ipcRenderer.invoke('reup:fetchSources', text),
    rewriteCaptions: (
      items: { key: string; text: string }[],
    ): Promise<ReupRewriteResult> =>
      ipcRenderer.invoke('reup:rewriteCaptions', items),
    scheduleVideos: (
      jobs: ReupScheduleJobPayload[],
    ): Promise<ReupScheduleBatchResult> =>
      ipcRenderer.invoke('reup:scheduleVideos', jobs),
    onScheduleProgress: (
      cb: (payload: ReupScheduleProgressPayload) => void,
    ): (() => void) => {
      const channel = 'reup:scheduleProgress';
      const handler = (
        _ev: Electron.IpcRendererEvent,
        payload: ReupScheduleProgressPayload,
      ) => {
        cb(payload);
      };
      ipcRenderer.on(channel, handler);
      return () => {
        ipcRenderer.removeListener(channel, handler);
      };
    },
  },
});
