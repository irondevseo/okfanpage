import { ipcMain } from 'electron';
import type {
  AuthResult,
  FacebookRequestAuthResult,
} from '../shared/auth-types';
import type { ListFanPagesResult } from '../shared/fanpage-types';
import { logAuthAxiosError } from './auth-logger';
import { fetchManagedFanPagesWithFallback } from './facebook-pages';
import {
  extractAccessToken,
  isInvalidFacebookSession,
  isLikelyNetworkError,
  normalizeFacebookCookieString,
  profileFromCookies,
} from './facebook-auth';
import { createTypedStore } from './typed-store';

const STORE_KEY = 'facebookCookies' as const;

type StoreSchema = {
  [STORE_KEY]?: string;
};

const store = createTypedStore<StoreSchema>({
  name: 'okfanpage-auth',
  defaults: {},
});

function getStoredCookies(): string | undefined {
  const v = store.get(STORE_KEY);
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

export function getStoredFacebookCookies(): string | undefined {
  return getStoredCookies();
}

async function tryProfileFromStoredCookies(): Promise<AuthResult> {
  const cookies = getStoredCookies();
  if (!cookies) {
    return { ok: false, code: 'NO_COOKIE' };
  }

  try {
    const profile = await profileFromCookies(cookies);
    return { ok: true, profile };
  } catch (err) {
    logAuthAxiosError('auth:restore', err);
    if (isLikelyNetworkError(err)) {
      return {
        ok: false,
        code: 'NETWORK',
        hasStoredCookies: true,
        message:
          'Không kết nối được Facebook. Kiểm tra mạng rồi thử đăng nhập lại.',
      };
    }
    if (isInvalidFacebookSession(err)) {
      store.delete(STORE_KEY);
      return {
        ok: false,
        code: 'INVALID',
        message: err instanceof Error ? err.message : 'Phiên đăng nhập không hợp lệ.',
      };
    }
    return {
      ok: false,
      code: 'NETWORK',
      hasStoredCookies: true,
      message:
        err instanceof Error
          ? err.message
          : 'Không xác thực được. Thử lại sau.',
    };
  }
}

export function registerAuthIpc(): void {
  ipcMain.handle('auth:restore', async (): Promise<AuthResult> => {
    return tryProfileFromStoredCookies();
  });

  ipcMain.handle('auth:login', async (_e, cookies: string): Promise<AuthResult> => {
    const normalized = normalizeFacebookCookieString(
      typeof cookies === 'string' ? cookies : '',
    );
    if (!normalized) {
      return { ok: false, code: 'INVALID', message: 'Vui lòng dán cookie Facebook.' };
    }

    try {
      const profile = await profileFromCookies(normalized);
      store.set(STORE_KEY, normalized);
      return { ok: true, profile };
    } catch (err) {
      logAuthAxiosError('auth:login', err);
      if (isLikelyNetworkError(err)) {
        return {
          ok: false,
          code: 'NETWORK',
          message: 'Lỗi mạng. Kiểm tra kết nối và thử lại.',
        };
      }
      return {
        ok: false,
        code: 'INVALID',
        message: err instanceof Error ? err.message : 'Đăng nhập thất bại.',
      };
    }
  });

  ipcMain.handle('auth:logout', async () => {
    store.delete(STORE_KEY);
  });

  ipcMain.handle('auth:validate', async (): Promise<AuthResult> => {
    return tryProfileFromStoredCookies();
  });

  ipcMain.handle(
    'auth:getFacebookRequestAuth',
    async (): Promise<FacebookRequestAuthResult> => {
      const cookies = getStoredCookies();
      if (!cookies) {
        return { ok: false, code: 'NO_COOKIE' };
      }
      try {
        const accessToken = await extractAccessToken(cookies);
        return {
          ok: true,
          bundle: {
            accessToken,
            headers: {
              Cookie: cookies,
              Authorization: `Bearer ${accessToken}`,
            },
          },
        };
      } catch (err) {
        logAuthAxiosError('auth:getFacebookRequestAuth', err);
        if (isLikelyNetworkError(err)) {
          return {
            ok: false,
            code: 'NETWORK',
            message: 'Lỗi mạng khi lấy token.',
          };
        }
        if (isInvalidFacebookSession(err)) {
          store.delete(STORE_KEY);
          return {
            ok: false,
            code: 'INVALID',
            message: err instanceof Error ? err.message : 'Phiên hết hạn.',
          };
        }
        return {
          ok: false,
          code: 'INVALID',
          message: err instanceof Error ? err.message : 'Không lấy được token.',
        };
      }
    },
  );

  ipcMain.handle(
    'facebook:listManagedPages',
    async (): Promise<ListFanPagesResult> => {
      const cookies = getStoredCookies();
      if (!cookies) {
        return { ok: false, code: 'NO_COOKIE' };
      }
      try {
        const userToken = await extractAccessToken(cookies);
        const pages = await fetchManagedFanPagesWithFallback(userToken, cookies);
        return { ok: true, pages };
      } catch (err) {
        logAuthAxiosError('facebook:listManagedPages', err);
        if (isLikelyNetworkError(err)) {
          return {
            ok: false,
            code: 'NETWORK',
            message: 'Lỗi mạng khi tải danh sách Fanpage.',
          };
        }
        if (isInvalidFacebookSession(err)) {
          store.delete(STORE_KEY);
          return {
            ok: false,
            code: 'INVALID',
            message: err instanceof Error ? err.message : 'Phiên hết hạn.',
          };
        }
        return {
          ok: false,
          code: 'INVALID',
          message: err instanceof Error ? err.message : 'Không tải được Fanpage.',
        };
      }
    },
  );
}
