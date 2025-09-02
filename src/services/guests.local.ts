import { putGuests, getAllGuests, type GuestSummary, clearGuests } from '@/db/idb';
import { apiFetch } from '@/lib/http';
import { normalize } from '@/utils/normalize';

const PAGE_SIZE = 2000;
const CACHE_TTL_MS = 24*60*60*1000;
const TS_KEY = 'guest_cache_ts_v1';

function mapGuest(x:any): GuestSummary {
  const g: GuestSummary = { id:String(x.id), name:x.name ?? x.fullName ?? '', phone:x.phone ?? '', email:x.email ?? '' };
  g._n = normalize(`${g.name} ${g.phone} ${g.email}`);
  return g;
}

export async function hydrateGuests(force=false): Promise<number> {
  const last = Number(localStorage.getItem(TS_KEY) || 0);
  const freshEnough = Date.now() - last < CACHE_TTL_MS;
  if (!force && freshEnough && (await getAllGuests()).length > 0) return 0;
  const t0 = performance.now();
  const all: GuestSummary[] = [];
  let page = 1;
  for (;;) {
    const res = await apiFetch(`/api/guests?page=${page}&pageSize=${PAGE_SIZE}`);
    const data = await res.json();
    const items = data.items ?? data ?? [];
    if (!items.length) break;
    all.push(...items.map(mapGuest));
    if (items.length < PAGE_SIZE) break;
    page++;
  }
  await clearStaleThenPut(all);
  localStorage.setItem(TS_KEY, String(Date.now()));
  if (import.meta.env.DEV) {
    console.log('hydrated guests', all.length, 'in', Math.round(performance.now()-t0), 'ms');
  }
  return all.length;
}

async function clearStaleThenPut(all: GuestSummary[]) {
  await clearGuests();
  await putGuests(all);
}
