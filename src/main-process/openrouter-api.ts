import axios, { isAxiosError } from 'axios';
import type { OpenRouterModelOption } from '../shared/settings-types';
import { logAuthPhase } from './auth-logger';

const MODELS_URL = 'https://openrouter.ai/api/v1/models';

type OpenRouterModelsResponse = {
  data?: Array<{ id: string; name?: string }>;
};

export async function fetchOpenRouterModels(
  apiKey?: string,
): Promise<OpenRouterModelOption[]> {
  const headers: Record<string, string> = {};
  if (apiKey?.trim()) {
    headers.Authorization = `Bearer ${apiKey.trim()}`;
  }
  try {
    const { data } = await axios.get<OpenRouterModelsResponse>(MODELS_URL, {
      headers,
      timeout: 45_000,
      validateStatus: (s) => s >= 200 && s < 300,
    });
    const raw = data.data ?? [];
    const models = raw
      .filter((m) => m.id)
      .map((m) => ({
        id: m.id,
        name: m.name?.trim() || m.id,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'en'));
    logAuthPhase('openrouter-models-ok', { count: models.length });
    return models;
  } catch (err) {
    const msg = isAxiosError(err)
      ? err.response?.data &&
        typeof err.response.data === 'object' &&
        'error' in err.response.data
        ? JSON.stringify((err.response.data as { error: unknown }).error)
        : err.message
      : err instanceof Error
        ? err.message
        : String(err);
    logAuthPhase('openrouter-models-error', { message: msg });
    throw err;
  }
}
