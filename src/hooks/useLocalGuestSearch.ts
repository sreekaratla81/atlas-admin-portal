import { useEffect, useMemo, useState } from "react";
import { getGuestsPage, GuestLite } from "../api/guests";

type LoadOptions = { maxRecords?: number; pageSize?: number };

export function useLocalGuestSearch(query: string, opts: LoadOptions = {}) {
  const maxRecords = opts.maxRecords ?? 2000;
  const pageSize = opts.pageSize ?? 200;

  const [pool, setPool] = useState<GuestLite[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function ensureLoaded() {
    if (loaded || loading) return;
    setLoading(true);
    const acc: GuestLite[] = [];
    let page = 1;
    try {
      while (acc.length < maxRecords) {
        const res = await getGuestsPage(page, pageSize);
        const items: GuestLite[] = res.items.map((g: any) => ({
          id: g.id, name: g.name, phone: g.phone, email: g.email
        }));
        acc.push(...items);
        if (!items.length || items.length < pageSize) break;
        page++;
      }
      setPool(acc);
      setLoaded(true);
    } finally { setLoading(false); }
  }

  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    if (typeof window === "undefined") {
      setDebounced(query.trim());
      return;
    }
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    if (!pool || !debounced) return [];
    const q = debounced.toLowerCase();
    const isDigits = /^\d+$/.test(q);
    return pool.filter(g => {
      if (isDigits) return (g.phone ?? "").replace(/\D/g, "").includes(q);
      return (g.name ?? "").toLowerCase().includes(q)
          || (g.email ?? "").toLowerCase().includes(q)
          || (g.phone ?? "").toLowerCase().includes(q);
    }).slice(0, 20);
  }, [pool, debounced]);

  return { results, loading, ensureLoaded, loaded };
}
