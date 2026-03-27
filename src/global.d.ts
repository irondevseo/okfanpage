import type { AuthResult, FacebookRequestAuthResult } from './shared/auth-types';
import type { ListFanPagesResult } from './shared/fanpage-types';
import type {
  ReupFetchSourcesResult,
  ReupRewriteResult,
  ReupScheduleBatchResult,
  ReupScheduleJobPayload,
  ReupScheduleProgressPayload,
} from './shared/reup-types';
import type {
  ContentPromptPublicSettings,
  ContentPromptSetPayload,
  ListOpenRouterModelsResult,
  OpenRouterPublicSettings,
  OpenRouterSetPayload,
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
      };
      openrouter: {
        listModels: (apiKey?: string) => Promise<ListOpenRouterModelsResult>;
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
    };
  }
}

export {};
