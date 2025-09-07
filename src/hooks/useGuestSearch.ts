import { useMemo } from 'react';

export interface Guest { id: string; name: string; email?: string; phone?: string; }

const norm = (s: string) => s?.toLowerCase().trim() ?? '';

export const useGuestSearch = (allGuests?: Guest[]) => {
  const localIdx = useMemo(() => allGuests ?? [], [allGuests]);

  return useMemo(() => {
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
};

