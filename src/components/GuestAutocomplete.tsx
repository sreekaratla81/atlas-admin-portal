import { useEffect, useState } from "react";
import { useLocalGuestSearch } from "../hooks/useLocalGuestSearch";
import type { GuestLite } from "../api/guests";
import { getGuestSearchMode } from "@/lib/env";
import { api, asArray } from "@/lib/api";

export default function GuestAutocomplete({
  onSelect, onAddNew
}: { onSelect: (g: GuestLite) => void; onAddNew: () => void; }) {

  const [q, setQ] = useState("");
  const mode = getGuestSearchMode();
  const local = useLocalGuestSearch(q, { maxRecords: 2000, pageSize: 200 });
  const [remoteResults, setRemoteResults] = useState<GuestLite[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);

  useEffect(() => {
    if (mode !== "api") return;
    const t = setTimeout(async () => {
      const term = q.trim();
      if (!term) { setRemoteResults([]); return; }
      setRemoteLoading(true);
      try {
        const { data } = await api.get(`/guests`, { params: { q: term } });
        setRemoteResults(asArray(data, "guests"));
      } catch (err) {
        setRemoteResults([]);
      } finally { setRemoteLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q, mode]);

  const results = mode === "local" ? local.results : remoteResults;
  const loading = mode === "local" ? local.loading : remoteLoading;
  const ensureLoaded = mode === "local" ? local.ensureLoaded : () => {};

  return (
    <div className="relative">
      <input
        placeholder="Search or Add Guest"
        value={q}
        onFocus={ensureLoaded}
        onChange={(e) => setQ(e.target.value)}
        className="input"
      />
      {q && (
        <div className="dropdown">
          {loading && <div className="item">Loading guests…</div>}
          {!loading && results.map(r => (
            <div key={r.id} className="item" onClick={() => onSelect(r)}>
              <strong>{r.name}</strong> &nbsp;·&nbsp; {r.phone ?? ""} &nbsp;·&nbsp; {r.email ?? ""}
            </div>
          ))}
          {!loading && <div className="item add" onClick={onAddNew}>+ Add new guest</div>}
        </div>
      )}
    </div>
  );
}
