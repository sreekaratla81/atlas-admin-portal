import http from './http';

export interface GuestListItem {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export async function searchGuests(
  q: string,
  page = 1,
  pageSize = 10,
  signal?: AbortSignal
): Promise<GuestListItem[]> {
  const res = await http.get('/guests/search', {
    params: { query: q, page, pageSize },
    signal,
  });
  // assume API returns array or {items: []}
  return res.data?.items ?? res.data;
}
