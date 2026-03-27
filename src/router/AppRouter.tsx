import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { OpenRouterSettingsPanel } from '../components/settings/OpenRouterSettingsPanel';
import { PromptContentSettingsPanel } from '../components/settings/PromptContentSettingsPanel';
import { ReupRemixSettingsPanel } from '../components/settings/ReupRemixSettingsPanel';
import { AppLayout } from '../components/AppLayout';
import { RequireAuth } from '../components/RequireAuth';
import { CompetitorAnalysisPage } from '../pages/CompetitorAnalysisPage';
import { DownloaderPage } from '../pages/DownloaderPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { PostHistoryPage } from '../pages/PostHistoryPage';
import { ReupContentPage } from '../pages/ReupContentPage';
import { SettingsPage } from '../pages/SettingsPage';

export function AppRouter() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/reup" element={<ReupContentPage />} />
            <Route path="/downloader" element={<DownloaderPage />} />
            <Route path="/post-history" element={<PostHistoryPage />} />
            <Route path="/competitor" element={<CompetitorAnalysisPage />} />
            <Route path="/settings" element={<SettingsPage />}>
              <Route index element={<Navigate to="api-ai" replace />} />
              <Route path="api-ai" element={<OpenRouterSettingsPanel />} />
              <Route path="prompt-content" element={<PromptContentSettingsPanel />} />
              <Route path="reup-remix" element={<ReupRemixSettingsPanel />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
