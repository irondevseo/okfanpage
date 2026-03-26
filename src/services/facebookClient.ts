import type { ListFanPagesResult } from '../shared/fanpage-types';

function api() {
  if (typeof window === 'undefined' || !window.electronAPI) {
    throw new Error('Chỉ chạy trong Electron.');
  }
  return window.electronAPI;
}

export async function facebookListManagedPages(): Promise<ListFanPagesResult> {
  return api().facebook.listManagedPages();
}
