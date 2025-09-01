import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchGuests, GuestListItem } from '../api/guests';

export function useGuestSearch(q: string) {
  const digitsOnly = /^\d+$/.test(q);
  const min = digitsOnly ? 1 : 2;
  const [debounced, setDebounced] = useState(q);

  useEffect(() => {
    const skip = q.length > 0 && (q.includes('@') || (digitsOnly && q.length >= 7));
    if (skip) {
      setDebounced(q);
      return;
    }
    const handle = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(handle);
  }, [q, digitsOnly]);

  const query = useQuery<GuestListItem[]>({
    queryKey: ['guestSearch', debounced],
    queryFn: ({ signal }) => searchGuests(debounced, 1, 10, signal),
    staleTime: 60_000,
    enabled: debounced.length >= min,
  });

  return { ...query, results: query.data ?? [], minLength: min };
}

export default useGuestSearch;
