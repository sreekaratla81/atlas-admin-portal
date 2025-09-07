import { api } from '@/lib/api';

export type GuestLite = { id: string; name: string; phone?: string; email?: string };

export async function getGuests() {
  const { data } = await api.get('/guests');
  return data;
}
