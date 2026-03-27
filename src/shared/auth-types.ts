export type FacebookProfile = {
  id: string;
  name: string;
  pictureUrl: string;
};

export type AuthOk = { ok: true; profile: FacebookProfile };

export type ViaProfileSummary = {
  id: string;
  /** Hiển thị trong select (tên FB · user id). */
  label: string;
  facebookUserId?: string;
  isActive: boolean;
};

export type AuthFail = {
  ok: false;
  code: 'NO_COOKIE' | 'INVALID' | 'NETWORK';
  message?: string;
  /** Khi lỗi mạng nhưng vẫn còn cookie trong store — có thể bấm thử lại. */
  hasStoredCookies?: boolean;
  /** Còn via đã lưu — có thể chọn lại trên màn đăng nhập. */
  hasSavedVias?: boolean;
};

export type AuthResult = AuthOk | AuthFail;

/** Header gửi kèm request tới Facebook (web / Graph tùy endpoint). */
export type FacebookRequestHeaders = {
  Cookie: string;
  /** EAAB… — nhiều endpoint Graph dùng query `access_token` thay vì Bearer. */
  Authorization: `Bearer ${string}`;
};

export type FacebookRequestAuthBundle = {
  headers: FacebookRequestHeaders;
  accessToken: string;
};

export type FacebookRequestAuthResult =
  | { ok: true; bundle: FacebookRequestAuthBundle }
  | { ok: false; code: 'NO_COOKIE' | 'INVALID' | 'NETWORK'; message?: string };
