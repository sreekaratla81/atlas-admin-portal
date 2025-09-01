import { api } from "@/lib/api";

export type GuestLite = { id: string; name: string; phone?: string; email?: string };

export async function getGuestsPage(page = 1, pageSize = 200) {
  // MUST be your existing, already-working endpoint
  const { data } = await api.get(`/guests`, { params: { page, pageSize } });
  return data; // { items: [...], total: n }
}
