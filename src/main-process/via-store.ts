import { randomUUID } from 'node:crypto';
import type { FacebookProfile, ViaProfileSummary } from '../shared/auth-types';
import { createTypedStore } from './typed-store';

const LEGACY_KEY = 'facebookCookies' as const;

export type ViaProfileStored = {
  id: string;
  cookies: string;
  label: string;
  facebookUserId?: string;
  updatedAt: number;
};

type AuthStoreSchema = {
  [LEGACY_KEY]?: string;
  viaProfiles?: ViaProfileStored[];
  activeViaId?: string | null;
};

const store = createTypedStore<AuthStoreSchema>({
  name: 'okfanpage-auth',
  defaults: {},
});

function readProfiles(): ViaProfileStored[] {
  const raw = store.get('viaProfiles');
  return Array.isArray(raw) ? raw : [];
}

function writeProfiles(
  profiles: ViaProfileStored[],
  activeViaId: string | null,
): void {
  store.set('viaProfiles', profiles);
  store.set('activeViaId', activeViaId);
}

/** Một lần: cookie đơn → một via + active. */
export function migrateLegacyFacebookCookies(): void {
  const legacy = store.get(LEGACY_KEY);
  const profiles = readProfiles();
  if (
    profiles.length === 0 &&
    typeof legacy === 'string' &&
    legacy.trim() !== ''
  ) {
    const id = randomUUID();
    writeProfiles(
      [
        {
          id,
          cookies: legacy.trim(),
          label: 'Via (đã lưu trước đó)',
          updatedAt: Date.now(),
        },
      ],
      id,
    );
  }
  if (typeof legacy === 'string' && legacy.trim() !== '') {
    store.delete(LEGACY_KEY);
  }
}

export function getActiveViaId(): string | null {
  migrateLegacyFacebookCookies();
  const id = store.get('activeViaId');
  return typeof id === 'string' && id.trim() ? id.trim() : null;
}

export function getActiveCookies(): string | undefined {
  migrateLegacyFacebookCookies();
  const activeId = getActiveViaId();
  if (!activeId) {
    return undefined;
  }
  const p = readProfiles().find((x) => x.id === activeId);
  const c = p?.cookies?.trim();
  return c || undefined;
}

export function listViaSummaries(): ViaProfileSummary[] {
  migrateLegacyFacebookCookies();
  const activeId = getActiveViaId();
  return readProfiles().map((p) => ({
    id: p.id,
    label: p.label || 'Via',
    facebookUserId: p.facebookUserId,
    isActive: p.id === activeId,
  }));
}

export function getViaCookies(viaId: string): string | undefined {
  migrateLegacyFacebookCookies();
  const p = readProfiles().find((x) => x.id === viaId);
  const c = p?.cookies?.trim();
  return c || undefined;
}

export function setActiveViaId(id: string | null): void {
  migrateLegacyFacebookCookies();
  store.set('activeViaId', id);
}

export function removeViaProfile(viaId: string): void {
  migrateLegacyFacebookCookies();
  const profiles = readProfiles().filter((p) => p.id !== viaId);
  let active = getActiveViaId();
  if (active === viaId) {
    active = null;
  }
  writeProfiles(profiles, active);
}

export function clearActiveSession(): void {
  migrateLegacyFacebookCookies();
  store.set('activeViaId', null);
}

export function upsertViaAfterValidLogin(
  normalizedCookies: string,
  profile: FacebookProfile,
): void {
  migrateLegacyFacebookCookies();
  const profiles = readProfiles();
  const now = Date.now();
  const label = `${profile.name} · ${profile.id}`;
  const idx = profiles.findIndex((p) => p.cookies === normalizedCookies);
  if (idx >= 0) {
    profiles[idx] = {
      ...profiles[idx],
      cookies: normalizedCookies,
      label,
      facebookUserId: profile.id,
      updatedAt: now,
    };
    writeProfiles(profiles, profiles[idx].id);
    return;
  }
  const id = randomUUID();
  profiles.push({
    id,
    cookies: normalizedCookies,
    label,
    facebookUserId: profile.id,
    updatedAt: now,
  });
  writeProfiles(profiles, id);
}

export function updateViaLabel(viaId: string, profile: FacebookProfile): void {
  migrateLegacyFacebookCookies();
  const profiles = readProfiles();
  const idx = profiles.findIndex((p) => p.id === viaId);
  if (idx < 0) {
    return;
  }
  profiles[idx] = {
    ...profiles[idx],
    label: `${profile.name} · ${profile.id}`,
    facebookUserId: profile.id,
    updatedAt: Date.now(),
  };
  writeProfiles(profiles, getActiveViaId());
}

export function hasAnyViaProfiles(): boolean {
  migrateLegacyFacebookCookies();
  return readProfiles().length > 0;
}
