import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { FacebookProfile } from '../shared/auth-types';
import {
  authLogin,
  authLogout,
  authRestore,
  authSwitchVia,
  authValidate,
} from '../services/authClient';

type AuthStatus = 'boot' | 'ready';

type AuthContextValue = {
  profile: FacebookProfile | null;
  status: AuthStatus;
  bootMessage: string | null;
  canRetryWithStoredCookies: boolean;
  login: (cookies: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  /** Đăng nhập bằng via đã lưu (cookie còn hiệu lực). */
  switchVia: (
    viaId: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  retryRestore: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FacebookProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('boot');
  const [bootMessage, setBootMessage] = useState<string | null>(null);
  const [canRetryWithStoredCookies, setCanRetryWithStoredCookies] =
    useState(false);

  const runRestore = useCallback(async () => {
    setBootMessage(null);
    setCanRetryWithStoredCookies(false);
    const r = await authRestore();
    if (r.ok === true) {
      setProfile(r.profile);
      return;
    }
    setProfile(null);
    if (r.code === 'NETWORK') {
      setBootMessage(r.message ?? null);
      setCanRetryWithStoredCookies(Boolean(r.hasStoredCookies));
      return;
    }
    if (r.code === 'INVALID' && r.message) {
      setBootMessage(r.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await runRestore();
      } finally {
        setStatus('ready');
      }
    })();
  }, [runRestore]);

  useEffect(() => {
    const onFocus = async () => {
      if (!profile) {
        return;
      }
      const r = await authValidate();
      if (r.ok === true) {
        setProfile(r.profile);
        return;
      }
      if (r.code === 'NETWORK') {
        return;
      }
      setProfile(null);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [profile]);

  const login = useCallback(
    async (cookies: string) => {
      const r = await authLogin(cookies);
      if (r.ok === true) {
        setProfile(r.profile);
        setBootMessage(null);
        setCanRetryWithStoredCookies(false);
        return { ok: true as const };
      }
      if (r.code === 'NETWORK') {
        return {
          ok: false as const,
          message: r.message ?? 'Lỗi mạng. Thử lại sau.',
        };
      }
      return {
        ok: false as const,
        message: r.message ?? 'Đăng nhập thất bại.',
      };
    },
    [],
  );

  const switchVia = useCallback(async (viaId: string) => {
    const r = await authSwitchVia(viaId.trim());
    if (r.ok === true) {
      setProfile(r.profile);
      setBootMessage(null);
      setCanRetryWithStoredCookies(false);
      return { ok: true as const };
    }
    if (r.code === 'NETWORK') {
      return {
        ok: false as const,
        message: r.message ?? 'Lỗi mạng. Thử lại sau.',
      };
    }
    return {
      ok: false as const,
      message: r.message ?? 'Không đăng nhập được via này.',
    };
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setProfile(null);
    setBootMessage(null);
    setCanRetryWithStoredCookies(false);
  }, []);

  const retryRestore = useCallback(async () => {
    setStatus('boot');
    try {
      await runRestore();
    } finally {
      setStatus('ready');
    }
  }, [runRestore]);

  const value = useMemo(
    () => ({
      profile,
      status,
      bootMessage,
      canRetryWithStoredCookies,
      login,
      switchVia,
      logout,
      retryRestore,
    }),
    [
      profile,
      status,
      bootMessage,
      canRetryWithStoredCookies,
      login,
      switchVia,
      logout,
      retryRestore,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải dùng bên trong AuthProvider.');
  }
  return ctx;
}
