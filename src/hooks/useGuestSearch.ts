import { useMemo, useState } from 'react';
import axios from 'axios';
import { getApiBase, getGuestSearchMode } from '@/utils/env';

export interface Guest { id: string; name: string; email?: string; phone?: string; }
type SearchFn = (q: string, signal?: AbortSignal) => Promise<Guest[]>;

const normalize = (s: string) => s.toLowerCase().trim();

export const useGuestSearch = (allGuests: Guest[] | null): SearchFn => {
  const mode = getGuestSearchMode();
  const [apiBase] = useState(() => getApiBase());

  const localSearch = useMemo(() => {
    const idx = allGuests ?? [];
    return async (q: string) => {
      const n = normalize(q);
      if (!n) return [];
      return idx.filter(g =>
        (g.name && normalize(g.name).includes(n)) ||
        (g.email && normalize(g.email).includes(n)) ||
        (g.phone && normalize(g.phone).includes(n))
      ).slice(0, 50);
    };
  }, [allGuests]);

  const remoteSearch = async (q: string, signal?: AbortSignal) => {
    if (!q?.trim()) return [];
    const url = `${apiBase}/api/guests/search?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get<Guest[]>(url, { timeout: 8000, signal });
    return Array.isArray(data) ? data : [];
  };

  // Fallback: if remote fails, try local if available
  return async (q: string, signal?: AbortSignal) => {
    if (mode === 'local') return localSearch(q);
    try {
      return await remoteSearch(q, signal);
    } catch (err) {
      if (allGuests?.length) return localSearch(q);
      throw err;
    }
  };
};
