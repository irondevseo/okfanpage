import { ipcMain } from 'electron';
import type {
  AuthResult,
  FacebookRequestAuthResult,
  ViaProfileSummary,
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
import {
  clearActiveSession,
  getActiveCookies,
  getActiveViaId,
  getViaCookies,
  hasAnyViaProfiles,
  listViaSummaries,
  migrateLegacyFacebookCookies,
  removeViaProfile,
  setActiveViaId,
  updateViaLabel,
  upsertViaAfterValidLogin,
} from './via-store';

export function getStoredFacebookCookies(): string | undefined {
  migrateLegacyFacebookCookies();
  return getActiveCookies();
}

async function tryProfileFromActiveVia(): Promise<AuthResult> {
  migrateLegacyFacebookCookies();
  const cookies = getActiveCookies();
  const activeId = getActiveViaId();

  if (!cookies) {
    if (hasAnyViaProfiles()) {
      return {
        ok: false,
        code: 'NO_COOKIE',
        message: 'Chọn một via đã lưu hoặc dán cookie mới để đăng nhập.',
        hasSavedVias: true,
      };
    }
    return { ok: false, code: 'NO_COOKIE' };
  }

  try {
    const profile = await profileFromCookies(cookies);
    if (activeId) {
      updateViaLabel(activeId, profile);
    }
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
      if (activeId) {
        removeViaProfile(activeId);
      }
      return {
        ok: false,
        code: 'INVALID',
        message:
          err instanceof Error
            ? err.message
            : 'Phiên đăng nhập không hợp lệ — via đã được gỡ.',
        hasSavedVias: hasAnyViaProfiles(),
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
  ipcMain.handle('auth:listViaProfiles', async (): Promise<ViaProfileSummary[]> => {
    return listViaSummaries();
  });

  ipcMain.handle(
    'auth:switchVia',
    async (_e, viaId: string): Promise<AuthResult> => {
      const id = typeof viaId === 'string' ? viaId.trim() : '';
      if (!id) {
        return { ok: false, code: 'INVALID', message: 'Chưa chọn via.' };
      }
      const cookies = getViaCookies(id);
      if (!cookies) {
        return { ok: false, code: 'INVALID', message: 'Không tìm thấy via.' };
      }
      setActiveViaId(id);
      try {
        const profile = await profileFromCookies(cookies);
        updateViaLabel(id, profile);
        return { ok: true, profile };
      } catch (err) {
        logAuthAxiosError('auth:switchVia', err);
        if (isLikelyNetworkError(err)) {
          return {
            ok: false,
            code: 'NETWORK',
            message: 'Lỗi mạng. Kiểm tra kết nối và thử lại.',
          };
        }
        if (isInvalidFacebookSession(err)) {
          removeViaProfile(id);
          return {
            ok: false,
            code: 'INVALID',
            message:
              'Cookie via này không còn hiệu lực — đã xóa khỏi danh sách.',
            hasSavedVias: hasAnyViaProfiles(),
          };
        }
        return {
          ok: false,
          code: 'INVALID',
          message:
            err instanceof Error ? err.message : 'Không đăng nhập được via này.',
        };
      }
    },
  );

  ipcMain.handle('auth:deleteVia', async (_e, viaId: string): Promise<void> => {
    const id = typeof viaId === 'string' ? viaId.trim() : '';
    if (id) {
      removeViaProfile(id);
    }
  });

  ipcMain.handle('auth:restore', async (): Promise<AuthResult> => {
    return tryProfileFromActiveVia();
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
      upsertViaAfterValidLogin(normalized, profile);
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
    clearActiveSession();
  });

  ipcMain.handle('auth:validate', async (): Promise<AuthResult> => {
    return tryProfileFromActiveVia();
  });

  ipcMain.handle(
    'auth:getFacebookRequestAuth',
    async (): Promise<FacebookRequestAuthResult> => {
      const cookies = getActiveCookies();
      const activeId = getActiveViaId();
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
          if (activeId) {
            removeViaProfile(activeId);
          }
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
      const cookies = getActiveCookies();
      const activeId = getActiveViaId();
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
          if (activeId) {
            removeViaProfile(activeId);
          }
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
