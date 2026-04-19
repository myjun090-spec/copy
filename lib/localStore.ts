import type { StashedLink } from '@/contexts/AppContext';

const LINKS_KEY = 'dawith_copy_links_v1';
const MODE_KEY = 'dawith_copy_storage_mode';

export type StorageMode = 'cloud' | 'local';

export function getStorageMode(): StorageMode {
  if (typeof window === 'undefined') return 'cloud';
  return window.localStorage.getItem(MODE_KEY) === 'local' ? 'local' : 'cloud';
}

export function setStorageMode(mode: StorageMode): void {
  if (typeof window === 'undefined') return;
  if (mode === 'local') window.localStorage.setItem(MODE_KEY, 'local');
  else window.localStorage.removeItem(MODE_KEY);
}

export function loadLocalLinks(): StashedLink[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LINKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistLocalLinks(links: StashedLink[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

export function addLocalLink(data: Omit<StashedLink, 'id' | 'createdAt'>): StashedLink {
  const list = loadLocalLinks();
  const now = Date.now();
  const newLink: StashedLink = {
    ...data,
    id: `local_${now}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
  };
  const next = [newLink, ...list];
  persistLocalLinks(next);
  return newLink;
}

export function addLocalLinks(items: Omit<StashedLink, 'id' | 'createdAt'>[]): StashedLink[] {
  const now = Date.now();
  const created: StashedLink[] = items.map((data, i) => ({
    ...data,
    id: `local_${now}_${i}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now + i,
  }));
  const next = [...created, ...loadLocalLinks()];
  persistLocalLinks(next);
  return created;
}

export function removeLocalLink(id: string): void {
  persistLocalLinks(loadLocalLinks().filter(l => l.id !== id));
}

export function removeLocalLinks(ids: string[]): void {
  const set = new Set(ids);
  persistLocalLinks(loadLocalLinks().filter(l => !set.has(l.id)));
}
