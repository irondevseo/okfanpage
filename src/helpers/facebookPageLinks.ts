export type ParsedPageRef =
  | { kind: 'id'; value: string; rawUrl: string }
  | { kind: 'username'; value: string; rawUrl: string };

/** Chuẩn hóa URL để `new URL()` parse được (nhiều user dán thiếu https://). */
export function normalizeFacebookUrlInput(raw: string): string {
  const t = raw.trim();
  if (!t) {
    return t;
  }
  try {
    new URL(t);
    return t;
  } catch {
    const withProto = t.startsWith('//') ? `https:${t}` : `https://${t}`;
    try {
      new URL(withProto);
      return withProto;
    } catch {
      return t;
    }
  }
}

/**
 * Trích username hoặc id Page từ dòng URL Facebook.
 */
export function parseFacebookPageUrlLine(line: string): ParsedPageRef | null {
  const trimmed = normalizeFacebookUrlInput(line);
  if (!trimmed) {
    return null;
  }
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '');
  if (!host.includes('facebook.com') && !host.includes('fb.com')) {
    return null;
  }

  if (u.pathname.includes('profile.php')) {
    const id = u.searchParams.get('id');
    if (id && /^\d+$/.test(id)) {
      return { kind: 'id', value: id, rawUrl: trimmed };
    }
    return null;
  }

  const parts = u.pathname.split('/').filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  const first = parts[0];
  if (first === 'pages' && parts[1]) {
    const slug = parts[1];
    if (/^\d+$/.test(slug)) {
      return { kind: 'id', value: slug, rawUrl: trimmed };
    }
    return { kind: 'username', value: slug, rawUrl: trimmed };
  }

  if (/^\d+$/.test(first)) {
    return { kind: 'id', value: first, rawUrl: trimmed };
  }

  if (
    [
      'watch',
      'reel',
      'groups',
      'marketplace',
      'events',
      'gaming',
      'photo',
      'story.php',
      'stories',
      'share',
    ].includes(first)
  ) {
    return null;
  }

  return { kind: 'username', value: first, rawUrl: trimmed };
}

export function parseFacebookPageUrlsBlock(text: string): ParsedPageRef[] {
  const lines = text.split(/\r?\n/);
  const out: ParsedPageRef[] = [];
  for (const line of lines) {
    const p = parseFacebookPageUrlLine(line);
    if (p) {
      out.push(p);
    }
  }
  return out;
}
