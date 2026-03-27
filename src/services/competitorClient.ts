import type {
  CompetitorAnalyzePayload,
  CompetitorAnalyzeResult,
  CompetitorFetchPostsPayload,
  CompetitorFetchPostsResult,
} from '../shared/competitor-analysis-types';

export async function competitorFetchPosts(
  payload: CompetitorFetchPostsPayload,
): Promise<CompetitorFetchPostsResult> {
  return window.electronAPI.competitor.fetchPosts(payload);
}

export async function competitorAnalyze(
  payload: CompetitorAnalyzePayload,
): Promise<CompetitorAnalyzeResult> {
  return window.electronAPI.competitor.analyze(payload);
}
