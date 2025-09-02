import { useMemo } from 'react';
import axios from 'axios';
import { getApiBase, getGuestSearchMode } from '@/utils/env';

export interface Guest { id: string; name: string; email?: string; phone?: string; }

const norm = (s: string) => s?.toLowerCase().trim() ?? '';

export const useGuestSearch = (allGuests?: Guest[]) => {
  const mode = getGuestSearchMode();
  const apiBase = getApiBase();

  const localIdx = useMemo(() => allGuests ?? [], [allGuests]);

  const localSearch = useMemo(() => {
    return async (q: string) => {
      const n = norm(q);
      if (!n) return [];
      return localIdx
        .filter(g =>
          norm(g.name).includes(n) ||
          norm(g.email).includes(n) ||
          norm(g.phone).includes(n)
        )
        .slice(0, 50);
    };
  }, [localIdx]);

  const remoteSearch = useMemo(() => {
    return async (q: string) => {
      const n = q?.trim();
      if (!n) return [];
      const url = `${apiBase}/api/guests/search?q=${encodeURIComponent(n)}`;
      const { data } = await axios.get<Guest[]>(url, { timeout: 8000 });
      return Array.isArray(data) ? data : [];
    };
  }, [apiBase]);

  return useMemo(() => {
    if (mode === 'local') return localSearch;
    return async (q: string) => {
      try {
        return await remoteSearch(q);
      } catch (err) {
        if (localIdx.length) return localSearch(q);
        throw err;
      }
    };
  }, [mode, localSearch, remoteSearch, localIdx.length]);
};

