import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { authGetFacebookRequestAuth } from '../services/authClient';
import type {
  FacebookRequestAuthBundle,
  FacebookRequestHeaders,
} from '../shared/auth-types';

/**
 * Mỗi lần gọi `build` / `buildHeaders`, main process trích lại EAAB từ cookie đã lưu
 * và trả về header kiểu plan: `{ Cookie, Authorization: Bearer … }`.
 *
 * Graph API thường cần thêm `access_token` trên query — dùng `bundle.accessToken`.
 */
export function useFacebookRequestHeaders() {
  const { profile, status } = useAuth();

  const build = useCallback(async (): Promise<FacebookRequestAuthBundle> => {
    if (status !== 'ready' || !profile) {
      throw new Error('Chưa đăng nhập Facebook trong app.');
    }
    const r = await authGetFacebookRequestAuth();
    if (!r.ok) {
      const fallback =
        r.code === 'NO_COOKIE'
          ? 'Chưa có cookie đăng nhập.'
          : r.code === 'NETWORK'
            ? 'Lỗi mạng khi lấy token.'
            : 'Không lấy được token từ cookie.';
      throw new Error(r.message ?? fallback);
    }
    return r.bundle;
  }, [profile, status]);

  const buildHeaders = useCallback(
    async (
      extra?: Record<string, string>,
    ): Promise<FacebookRequestHeaders & Record<string, string>> => {
      const { headers } = await build();
      return { ...headers, ...extra };
    },
    [build],
  );

  return {
    ready: status === 'ready' && profile !== null,
    build,
    buildHeaders,
  };
}
