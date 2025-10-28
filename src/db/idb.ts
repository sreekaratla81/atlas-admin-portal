// Tiny IndexedDB wrapper via idb library
import { openDB, IDBPDatabase } from 'idb';
export type GuestSummary = { id: string; name: string; phone?: string; email?: string; _n?: string };
const DB_NAME = 'atlas-admin';
const DB_VERSION = 1;
const STORE = 'guests';
let dbp: Promise<IDBPDatabase<any>>;
export function getDb() {
  if (!dbp) {
    dbp = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const s = db.createObjectStore(STORE, { keyPath: 'id' });
        s.createIndex('n_idx', '_n');
      }
    });
  }
  return dbp;
}
export async function putGuests(guests: GuestSummary[]) {
  const db = await getDb(); const tx = db.transaction(STORE, 'readwrite');
  for (const g of guests) await tx.store.put(g);
  await tx.done;
}

export async function saveGuest(guest: Partial<GuestSummary>) {
  const db = await getDb();
  const tx = db.transaction(STORE, 'readwrite');
  const payload: GuestSummary = {
    id: guest.id ?? String(Date.now()),
    name: guest.name ?? "",
    phone: guest.phone,
    email: guest.email,
    _n: guest._n ?? guest.name?.toLowerCase() ?? "",
  };
  await tx.store.put(payload);
  await tx.done;
  return payload;
}

export async function getAllGuests(): Promise<GuestSummary[]> {
  const db = await getDb(); return (await db.getAll(STORE)) as GuestSummary[];
}

export async function clearGuests(){ const db=await getDb(); await db.clear(STORE); }
