import { contextBridge, ipcRenderer } from 'electron';
import type {
  AuthResult,
  FacebookRequestAuthResult,
  ViaProfileSummary,
} from './shared/auth-types';
import type { ListFanPagesResult } from './shared/fanpage-types';
import type {
  ContentPromptPublicSettings,
  ContentPromptSetPayload,
  ListOpenRouterModelsResult,
  OpenRouterPublicSettings,
  OpenRouterSetPayload,
  ReupRemixPublicSettings,
  ReupRemixSetPayload,
} from './shared/settings-types';
import type {
  CompetitorAnalyzePayload,
  CompetitorAnalyzeResult,
  CompetitorFetchPostsPayload,
  CompetitorFetchPostsResult,
} from './shared/competitor-analysis-types';
import type {
  ReupFetchSourcesResult,
  ReupRewriteResult,
  ReupScheduleBatchResult,
  ReupScheduleJobPayload,
  ReupScheduleProgressPayload,
} from './shared/reup-types';
import type {
  VideoInfoItem,
  DownloadProgressPayload,
  DownloadRequest,
  DownloadStartResult,
} from './shared/downloader-types';
import type {
  PostHistoryFilter,
  PostHistoryListResult,
  PostHistoryStats,
} from './shared/post-history-types';

contextBridge.exposeInMainWorld('electronAPI', {
  auth: {
    restore: (): Promise<AuthResult> => ipcRenderer.invoke('auth:restore'),
    login: (cookies: string): Promise<AuthResult> =>
      ipcRenderer.invoke('auth:login', cookies),
    logout: (): Promise<void> => ipcRenderer.invoke('auth:logout'),
    validate: (): Promise<AuthResult> => ipcRenderer.invoke('auth:validate'),
    getFacebookRequestAuth: (): Promise<FacebookRequestAuthResult> =>
      ipcRenderer.invoke('auth:getFacebookRequestAuth'),
    listViaProfiles: (): Promise<ViaProfileSummary[]> =>
      ipcRenderer.invoke('auth:listViaProfiles'),
    switchVia: (viaId: string): Promise<AuthResult> =>
      ipcRenderer.invoke('auth:switchVia', viaId),
    deleteVia: (viaId: string): Promise<void> =>
      ipcRenderer.invoke('auth:deleteVia', viaId),
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
    getReupRemix: (): Promise<ReupRemixPublicSettings> =>
      ipcRenderer.invoke('settings:getReupRemix'),
    setReupRemix: (
      payload: ReupRemixSetPayload,
    ): Promise<ReupRemixPublicSettings> =>
      ipcRenderer.invoke('settings:setReupRemix', payload),
    pickLogoFile: (): Promise<string | null> =>
      ipcRenderer.invoke('settings:pickLogoFile'),
  },
  openrouter: {
    listModels: (apiKey?: string): Promise<ListOpenRouterModelsResult> =>
      ipcRenderer.invoke('openrouter:listModels', apiKey),
  },
  competitor: {
    fetchPosts: (
      payload: CompetitorFetchPostsPayload,
    ): Promise<CompetitorFetchPostsResult> =>
      ipcRenderer.invoke('competitor:fetchPosts', payload),
    analyze: (payload: CompetitorAnalyzePayload): Promise<CompetitorAnalyzeResult> =>
      ipcRenderer.invoke('competitor:analyze', payload),
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
  downloader: {
    checkYtDlp: (): Promise<{ ok: boolean; version?: string; message?: string }> =>
      ipcRenderer.invoke('downloader:checkYtDlp'),
    fetchInfo: (url: string): Promise<VideoInfoItem> =>
      ipcRenderer.invoke('downloader:fetchInfo', url),
    startDownload: (req: DownloadRequest): Promise<DownloadStartResult> =>
      ipcRenderer.invoke('downloader:startDownload', req),
    cancel: (id: string): Promise<boolean> =>
      ipcRenderer.invoke('downloader:cancel', id),
    pickOutputDir: (): Promise<string | null> =>
      ipcRenderer.invoke('downloader:pickOutputDir'),
    getOutputDir: (): Promise<string> =>
      ipcRenderer.invoke('downloader:getOutputDir'),
    openOutputDir: (): Promise<void> =>
      ipcRenderer.invoke('downloader:openOutputDir'),
    onProgress: (
      cb: (payload: DownloadProgressPayload) => void,
    ): (() => void) => {
      const channel = 'downloader:progress';
      const handler = (
        _ev: Electron.IpcRendererEvent,
        payload: DownloadProgressPayload,
      ) => {
        cb(payload);
      };
      ipcRenderer.on(channel, handler);
      return () => {
        ipcRenderer.removeListener(channel, handler);
      };
    },
  },
  postHistory: {
    list: (filter: PostHistoryFilter): Promise<PostHistoryListResult> =>
      ipcRenderer.invoke('postHistory:list', filter),
    stats: (): Promise<PostHistoryStats> =>
      ipcRenderer.invoke('postHistory:stats'),
    delete: (id: string): Promise<boolean> =>
      ipcRenderer.invoke('postHistory:delete', id),
    clear: (pageId?: string): Promise<number> =>
      ipcRenderer.invoke('postHistory:clear', pageId),
  },
});
