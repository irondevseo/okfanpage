import type { AuthResult, FacebookRequestAuthResult } from '../shared/auth-types';

function api() {
  if (typeof window === 'undefined' || !window.electronAPI) {
    throw new Error('Chỉ chạy trong Electron.');
  }
  return window.electronAPI;
}

export async function authRestore(): Promise<AuthResult> {
  return api().auth.restore();
}

export async function authLogin(cookies: string): Promise<AuthResult> {
  return api().auth.login(cookies);
}

export async function authLogout(): Promise<void> {
  return api().auth.logout();
}

export async function authValidate(): Promise<AuthResult> {
  return api().auth.validate();
}

export async function authGetFacebookRequestAuth(): Promise<FacebookRequestAuthResult> {
  return api().auth.getFacebookRequestAuth();
}
