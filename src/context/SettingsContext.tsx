import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { settingsGetOpenRouter } from '../services/settingsClient';
import type { OpenRouterPublicSettings } from '../shared/settings-types';

type SettingsContextValue = {
  openRouter: OpenRouterPublicSettings | null;
  openRouterReady: boolean;
  refreshOpenRouter: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [openRouter, setOpenRouter] = useState<OpenRouterPublicSettings | null>(
    null,
  );
  const [openRouterReady, setOpenRouterReady] = useState(false);

  const refreshOpenRouter = useCallback(async () => {
    const s = await settingsGetOpenRouter();
    setOpenRouter(s);
    setOpenRouterReady(true);
  }, []);

  useEffect(() => {
    void refreshOpenRouter();
  }, [refreshOpenRouter]);

  const value = useMemo(
    () => ({
      openRouter,
      openRouterReady,
      refreshOpenRouter,
    }),
    [openRouter, openRouterReady, refreshOpenRouter],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings phải dùng bên trong SettingsProvider.');
  }
  return ctx;
}
