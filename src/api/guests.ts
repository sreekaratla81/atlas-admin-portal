import { http } from "./http";

export type GuestLite = { id: string; name: string; phone?: string; email?: string };

export async function getGuestsPage(page = 1, pageSize = 200) {
  // MUST be your existing, already-working endpoint
  const { data } = await http.get(`/guests`, { params: { page, pageSize } });
  return data; // { items: [...], total: n }
}
