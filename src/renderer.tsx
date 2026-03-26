import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { FanPagesProvider } from './context/FanPagesContext';
import { SettingsProvider } from './context/SettingsContext';
import { AppRouter } from './router/AppRouter';
import './index.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <FanPagesProvider>
        <SettingsProvider>
          <AppRouter />
        </SettingsProvider>
      </FanPagesProvider>
    </AuthProvider>
  </StrictMode>,
);
