import type {
  AuthResult,
  FacebookRequestAuthResult,
  ViaProfileSummary,
} from '../shared/auth-types';

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

export async function authListViaProfiles(): Promise<ViaProfileSummary[]> {
  return api().auth.listViaProfiles();
}

export async function authSwitchVia(viaId: string): Promise<AuthResult> {
  return api().auth.switchVia(viaId);
}

export async function authDeleteVia(viaId: string): Promise<void> {
  return api().auth.deleteVia(viaId);
}
