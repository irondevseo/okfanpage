import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { facebookListManagedPages } from '../services/facebookClient';
import type { FanPage } from '../shared/fanpage-types';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

type FanPagesContextValue = {
  pages: FanPage[];
  loadStatus: LoadStatus;
  error: string | null;
  lastLoadedAt: number | null;
  /** Luôn gọi API (nút Reload). */
  reloadFanPages: () => Promise<void>;
};

const FanPagesContext = createContext<FanPagesContextValue | null>(null);

/** Tránh tự fetch lại sau StrictMode / remount; reset khi logout. */
let fanPagesSessionInitialFetchDone = false;

export function FanPagesProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [pages, setPages] = useState<FanPage[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);

  const pagesRef = useRef<FanPage[]>([]);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  const loadFanPages = useCallback(
    async (force: boolean) => {
      if (!profile) {
        return;
      }
      if (!force && pagesRef.current.length > 0) {
        return;
      }

      setLoadStatus('loading');
      setError(null);
      const r = await facebookListManagedPages();
      if (!r.ok) {
        setLoadStatus('error');
        setError(r.message ?? 'Không tải được danh sách Fanpage.');
        return;
      }
      setPages(r.pages);
      setLastLoadedAt(Date.now());
      setLoadStatus('ready');
    },
    [profile],
  );

  const reloadFanPages = useCallback(async () => {
    await loadFanPages(true);
  }, [loadFanPages]);

  useEffect(() => {
    if (!profile) {
      setPages([]);
      setLoadStatus('idle');
      setError(null);
      setLastLoadedAt(null);
      fanPagesSessionInitialFetchDone = false;
      return;
    }
    if (fanPagesSessionInitialFetchDone) {
      return;
    }
    fanPagesSessionInitialFetchDone = true;
    void loadFanPages(false);
  }, [profile, loadFanPages]);

  const value = useMemo(
    () => ({
      pages,
      loadStatus,
      error,
      lastLoadedAt,
      reloadFanPages,
    }),
    [pages, loadStatus, error, lastLoadedAt, reloadFanPages],
  );

  return (
    <FanPagesContext.Provider value={value}>{children}</FanPagesContext.Provider>
  );
}

export function useFanPages(): FanPagesContextValue {
  const ctx = useContext(FanPagesContext);
  if (!ctx) {
    throw new Error('useFanPages phải dùng bên trong FanPagesProvider.');
  }
  return ctx;
}
