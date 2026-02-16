import { putGuests, getAllGuests, type GuestSummary, clearGuests } from '@/db/idb';
import { api, asArray } from '@/lib/api';
import { normalize } from '@/utils/normalize';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const TS_KEY = 'guest_cache_ts_v1';

function mapGuest(x: { id?: unknown; name?: string; fullName?: string; phone?: string; email?: string }): GuestSummary {
  const g: GuestSummary = { id:String(x.id), name:x.name ?? x.fullName ?? '', phone:x.phone ?? '', email:x.email ?? '' };
  g._n = normalize(`${g.name} ${g.phone} ${g.email}`);
  return g;
}

export async function hydrateGuests(force=false): Promise<number> {
  const last = Number(localStorage.getItem(TS_KEY) || 0);
  const freshEnough = Date.now() - last < CACHE_TTL_MS;
  if (!force && freshEnough && (await getAllGuests()).length > 0) return 0;
  const t0 = performance.now();
  const { data } = await api.get('/guests');
  const items = asArray<{ id?: unknown; name?: string; fullName?: string; phone?: string; email?: string }>(data, 'guests');
  const all = items.map(mapGuest);
  await clearStaleThenPut(all);
  localStorage.setItem(TS_KEY, String(Date.now()));
  if (import.meta.env.DEV) {
    console.log('hydrated guests', all.length, 'in', Math.round(performance.now() - t0), 'ms');
  }
  return all.length;
}

async function clearStaleThenPut(all: GuestSummary[]) {
  await clearGuests();
  await putGuests(all);
}
