import type {
  AuthResult,
  FacebookRequestAuthResult,
  ViaProfileSummary,
} from './shared/auth-types';
import type { ListFanPagesResult } from './shared/fanpage-types';
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
  ContentPromptPublicSettings,
  ContentPromptSetPayload,
  ListOpenRouterModelsResult,
  OpenRouterPublicSettings,
  OpenRouterSetPayload,
  ReupRemixPublicSettings,
  ReupRemixSetPayload,
} from './shared/settings-types';

declare global {
  interface Window {
    electronAPI: {
      auth: {
        restore: () => Promise<AuthResult>;
        login: (cookies: string) => Promise<AuthResult>;
        logout: () => Promise<void>;
        validate: () => Promise<AuthResult>;
        getFacebookRequestAuth: () => Promise<FacebookRequestAuthResult>;
        listViaProfiles: () => Promise<ViaProfileSummary[]>;
        switchVia: (viaId: string) => Promise<AuthResult>;
        deleteVia: (viaId: string) => Promise<void>;
      };
      facebook: {
        listManagedPages: () => Promise<ListFanPagesResult>;
      };
      settings: {
        getOpenRouter: () => Promise<OpenRouterPublicSettings>;
        setOpenRouter: (
          payload: OpenRouterSetPayload,
        ) => Promise<OpenRouterPublicSettings>;
        getContentPrompt: () => Promise<ContentPromptPublicSettings>;
        setContentPrompt: (
          payload: ContentPromptSetPayload,
        ) => Promise<ContentPromptPublicSettings>;
        getReupRemix: () => Promise<ReupRemixPublicSettings>;
        setReupRemix: (
          payload: ReupRemixSetPayload,
        ) => Promise<ReupRemixPublicSettings>;
        pickLogoFile: () => Promise<string | null>;
      };
      openrouter: {
        listModels: (apiKey?: string) => Promise<ListOpenRouterModelsResult>;
      };
      competitor: {
        fetchPosts: (
          payload: CompetitorFetchPostsPayload,
        ) => Promise<CompetitorFetchPostsResult>;
        analyze: (payload: CompetitorAnalyzePayload) => Promise<CompetitorAnalyzeResult>;
      };
      reup: {
        fetchSources: (text: string) => Promise<ReupFetchSourcesResult>;
        rewriteCaptions: (
          items: { key: string; text: string }[],
        ) => Promise<ReupRewriteResult>;
        scheduleVideos: (
          jobs: ReupScheduleJobPayload[],
        ) => Promise<ReupScheduleBatchResult>;
        onScheduleProgress: (
          cb: (payload: ReupScheduleProgressPayload) => void,
        ) => () => void;
      };
      downloader: {
        checkYtDlp: () => Promise<{ ok: boolean; version?: string; message?: string }>;
        fetchInfo: (url: string) => Promise<VideoInfoItem>;
        startDownload: (req: DownloadRequest) => Promise<DownloadStartResult>;
        cancel: (id: string) => Promise<boolean>;
        pickOutputDir: () => Promise<string | null>;
        getOutputDir: () => Promise<string>;
        openOutputDir: () => Promise<void>;
        onProgress: (
          cb: (payload: DownloadProgressPayload) => void,
        ) => () => void;
      };
    };
  }
}

export {};
